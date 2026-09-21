import { higgsfieldSeedance25Provider } from "../providers/higgsfieldSeedance25.js";
import { minimaxH3Provider } from "../providers/minimaxH3.js";
import type { VideoProvider } from "../providers/types.js";

const providers: Record<string, VideoProvider> = {
  "minimax-h3": minimaxH3Provider,
  "higgsfield-seedance-2.5": higgsfieldSeedance25Provider,
};

function forcedEngine() {
  const value = (process.env.HOLO_VIDEO_ENGINE || "").trim();
  return value && providers[value] ? value : "";
}

function isConfigured(id: string) {
  if (id === "higgsfield-seedance-2.5") {
    return Boolean(
      process.env.HIGGSFIELD_API_KEY ||
      process.env.HF_CREDENTIALS ||
      process.env.HF_KEY,
    );
  }
  if (id === "minimax-h3") {
    const demo = (process.env.DEMO_VIDEO_MODE || "true").toLowerCase() === "true";
    return demo || Boolean(process.env.MINIMAX_API_KEY);
  }
  return false;
}

export function getVideoProvider(id?: string): VideoProvider {
  const selected = forcedEngine() || id || "minimax-h3";
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
