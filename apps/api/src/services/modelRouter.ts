import { minimaxH3Provider } from "../providers/minimaxH3.js";
import type { VideoProvider } from "../providers/types.js";

const providers: Record<string, VideoProvider> = { "minimax-h3": minimaxH3Provider };
export function getVideoProvider(id?: string): VideoProvider {
  return providers[id || "minimax-h3"] || minimaxH3Provider;
}
export function listVideoProviders() {
  return Object.values(providers).map(p => ({ id: p.id, name: p.displayName, enabled: true }));
}
