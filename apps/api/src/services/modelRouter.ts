import { comfyuiWanProvider, comfyConfigured } from "../providers/comfyuiWan.js";
import { higgsfieldSeedance25Provider } from "../providers/higgsfieldSeedance25.js";
import { minimaxH3Provider } from "../providers/minimaxH3.js";
import type { VideoProvider } from "../providers/types.js";

const providers: Record<string, VideoProvider> = {
  "minimax-h3": minimaxH3Provider,
  "comfyui-wan22": comfyuiWanProvider,
  "higgsfield-seedance-2.5": higgsfieldSeedance25Provider,
};

function forcedEngine() {
  const value = (process.env.HOLO_VIDEO_ENGINE || "").trim();
  return value && providers[value] && isConfigured(value) ? value : "";
}

function isConfigured(id: string) {
  if (id === "comfyui-wan22") return comfyConfigured();
  if (id === "higgsfield-seedance-2.5") {
    return Boolean(
      process.env.HIGGSFIELD_API_KEY ||
      process.env.HF_CREDENTIALS ||
      process.env.HF_KEY,
    );
  }
  if (id === "minimax-h3") {
    const hasKey = Boolean(process.env.MINIMAX_API_KEY);
    const demo = (process.env.DEMO_VIDEO_MODE || (hasKey ? "false" : "true")).toLowerCase() === "true";
    return demo || hasKey;
  }
  return false;
}

export function getVideoProvider(id?: string): VideoProvider {
  const selected = forcedEngine() || id || "minimax-h3";
  if (selected.startsWith("comfyui") && (!providers[selected] || !isConfigured(selected))) throw new Error("ComfyUI workflow is not registered or validated.");
  return providers[selected] || minimaxH3Provider;
}

export function activeVideoEngine(id?: string) {
  return getVideoProvider(id).id;
}

export function listVideoProviders() {
  return Object.values(providers).map((provider) => ({
    id: provider.id,
    name: provider.displayName,
    enabled: isConfigured(provider.id),
    active: getVideoProvider().id === provider.id,
  }));
}
