import { randomUUID } from "node:crypto";

export type ComfyWorkflow = Record<string, { class_type: string; inputs: Record<string, unknown> }>;
export type ComfyOutput = { filename: string; subfolder?: string; type?: string };

export function comfyuiConfigured(): boolean {
  return process.env.COMFYUI_ENABLED === "true" && Boolean(process.env.COMFYUI_BASE_URL && process.env.COMFYUI_API_TOKEN);
}

export class ComfyUIClient {
  constructor(private readonly fetcher: typeof fetch = fetch) {}

  private async request(path: string, init: RequestInit = {}, timeout = 30000): Promise<Response> {
    if (!comfyuiConfigured()) throw new Error("ComfyUI is disabled or not configured");
    const base = new URL(process.env.COMFYUI_BASE_URL!);
    if (base.protocol !== "https:" || base.username || base.password || base.search || base.hash) {
      throw new Error("ComfyUI requires an HTTPS authenticated gateway");
    }
    const url = base.href.replace(/\/$/, "") + path;
    const headers = new Headers(init.headers);
    headers.set("Authorization", "Bearer " + process.env.COMFYUI_API_TOKEN);
    const response = await this.fetcher(url, { ...init, headers, redirect: "error", signal: AbortSignal.timeout(timeout) });
    if (!response.ok) throw new Error("ComfyUI HTTP " + response.status);
    return response;
  }

  async health() {
    await this.request("/system_stats");
    return { ok: true };
  }

  async objectInfo(): Promise<unknown> {
    return (await this.request("/object_info")).json();
  }

  // Only call from trusted server-side code with an approved workflow, never raw user JSON.
  // Do not retry a submission automatically: a timeout may mean the GPU accepted it.
  async submit(workflow: ComfyWorkflow): Promise<string> {
    const response = await this.request("/prompt", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: workflow, client_id: randomUUID() }),
    });
    const data = await response.json() as { prompt_id?: unknown };
    if (typeof data.prompt_id !== "string" || !data.prompt_id) throw new Error("ComfyUI returned no prompt ID");
    return data.prompt_id;
  }

  async history(id: string): Promise<unknown> {
    return (await this.request("/history/" + encodeURIComponent(id))).json();
  }

  async uploadImage(bytes: Uint8Array, mime: "image/png" | "image/jpeg" | "image/webp"): Promise<unknown> {
    if (!bytes.length || bytes.length > 30 * 1024 * 1024) throw new Error("Invalid image size");
    const form = new FormData();
    const ext = mime === "image/jpeg" ? "jpg" : mime.split("/")[1];
    form.append("image", new Blob([new Uint8Array(bytes)], { type: mime }), randomUUID() + "." + ext);
    form.append("type", "input");
    form.append("overwrite", "false");
    return (await this.request("/upload/image", { method: "POST", body: form })).json();
  }

  async output(file: ComfyOutput): Promise<Response> {
    if (file.type && file.type !== "output") throw new Error("Only output files are supported");
    const query = new URLSearchParams({ filename: file.filename, subfolder: file.subfolder || "", type: "output" });
    return this.request("/view?" + query.toString(), {}, 120000);
  }
}
