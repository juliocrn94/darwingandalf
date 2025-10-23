export interface Agent {
  id: string;
  name: string;
  industry: string;
  description: string;
  mission: string;
  context: string;
  intents: Intent[];
  examples_count: number;
  slots_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface Intent {
  name: string;
  description: string;
}

export interface HandoffData {
  type: "audio_recording" | "audio_file" | "text" | "json";
  content: Blob | string;
  metadata?: {
    duration?: number;
    fileName?: string;
    fileSize?: number;
  };
}

export interface ProcessedHandoff {
  id: string;
  type: string;
  content: string;
  metadata: Record<string, any>;
  processed_data?: {
    transcription?: string;
    summary?: string;
    keywords?: string[];
  };
  created_at: string;
}

export interface PromptVariant {
  id: number;
  style: string;
  score: number;
  text: string;
}
