export type ComposerClip = {
  id?: string;
  url: string;
  start?: number;
  end?: number;
  trimStart?: number;
  trimEnd?: number;
  volume?: number;
};

export type ComposerNarration = {
  url?: string;
  text?: string;
  start?: number;
  end?: number;
  volume?: number;
};

export type ComposerOverlay = {
  type: "text" | "image" | "logo";
  text?: string;
  url?: string;
  start: number;
  end: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  style?: Record<string, string | number | boolean>;
};

export type ComposerSpec = {
  title: string;
  aspectRatio: string;
  resolution: string;
  fps: number;
  duration?: number;
  clips: ComposerClip[];
  narration?: ComposerNarration;
  musicUrl?: string;
  musicVolume?: number;
  overlays: ComposerOverlay[];
  transitions: Array<{
    fromClip: number;
    toClip: number;
    type: "cut" | "fade" | "crossfade";
    duration: number;
  }>;
  metadata?: Record<string, unknown>;
};

export type ComposerJob = {
  id: string;
  status: "queued" | "processing" | "completed" | "failed";
  progress: number;
  createdAt: string;
  updatedAt?: string;
  outputUrl?: string;
  error?: string;
  providerTaskId?: string;
  spec: ComposerSpec;
};
