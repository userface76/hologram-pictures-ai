export type VideoIntent = {
  intent: "create_video" | "revise_video" | "show_library" | "general";
  title: string;
  userRequest: string;
  refinedPrompt: string;
  negativePrompt?: string;
  model: string;
  duration: number;
  aspectRatio: string;
  resolution: string;
  audio: boolean;
  style?: string;
  camera?: string[];
  scenes: Array<{ index: number; seconds?: number; description: string }>;
};

export type RenderJob = {
  id: string;
  provider: string;
  model: string;
  status: "queued" | "processing" | "completed" | "failed";
  progress: number;
  createdAt: string;
  prompt: string;
  outputUrl?: string;
  providerTaskId?: string;
  error?: string;
};
