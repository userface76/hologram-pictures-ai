export type Graph = Record<string, { class_type: string; inputs: Record<string, unknown> }>;
export class ComfyClient {
  constructor(private base: string, private authorization: string, private request: typeof fetch = fetch) {
    const url = new URL(base);
    if (url.protocol !== "https:" && !(url.protocol === "http:" && ["localhost","127.0.0.1"].includes(url.hostname))) throw new Error("ComfyUI requires HTTPS");
    if (!authorization || url.username || url.password || url.search || url.hash) throw new Error("Invalid ComfyUI configuration");
    this.base = base.replace(/\/+$/, "");
  }
  private async call(path: string, body?: unknown) {
    const response = await this.request(this.base + path, {
      method: body === undefined ? "GET" : "POST",
      headers: { Authorization: this.authorization, "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      redirect: "error", signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) throw new Error("ComfyUI HTTP " + response.status);
    return response;
  }
  async health() { return (await this.call("/system_stats")).json(); }
  async schema() { return (await this.call("/object_info")).json(); }
  async submit(graph: Graph) {
    const result = await (await this.call("/prompt", { prompt: graph })).json() as { prompt_id?: string; node_errors?: Record<string, unknown> };
    if (!result.prompt_id || Object.keys(result.node_errors || {}).length) throw new Error("ComfyUI rejected workflow");
    return result.prompt_id;
  }
  async history(id: string) { return (await this.call("/history/" + encodeURIComponent(id))).json(); }
  async download(file: {filename: string; subfolder?: string; type: string}) {
    if (file.type !== "output" || !/\.mp4$/i.test(file.filename) || /[\\/]/.test(file.filename) || (file.subfolder || "").split(/[\\/]/).includes("..")) throw new Error("Invalid video output");
    return this.call("/view?" + new URLSearchParams({filename:file.filename,subfolder:file.subfolder || "",type:"output"}));
  }
}
export async function runpodPodInfo(podId: string, apiKey: string, request: typeof fetch = fetch) {
  if (!podId || !apiKey) throw new Error("RunPod credentials required");
  const response = await request("https://rest.runpod.io/v1/pods/" + encodeURIComponent(podId), {headers:{Authorization:"Bearer " + apiKey},redirect:"error",signal:AbortSignal.timeout(15000)});
  if (!response.ok) throw new Error("RunPod HTTP " + response.status);
  return response.json();
}
