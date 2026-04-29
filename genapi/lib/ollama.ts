const OLLAMA_BASE_URL = process.env.OLLAMA_API_URL || "http://localhost:11434";

export interface OllamaModel {
  name: string;
  size: number;
  modifiedAt: string;
  digest?: string;
  details?: {
    family?: string;
    format?: string;
    families?: string[];
    parameterSize?: string;
    quantizationLevel?: string;
  };
}

export interface OllamaStatus {
  status: "online" | "offline";
  version?: string;
  responseTime?: number;
}

export interface GenerationOptions {
  model: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  system?: string;
  context?: number[];
}

export interface GenerationResult {
  output: string;
  done: boolean;
  context?: number[];
  totalDuration?: number;
  loadDuration?: number;
  promptEvalCount?: number;
  promptEvalDuration?: number;
  evalCount?: number;
  evalDuration?: number;
  model?: string;
}

export interface PullProgress {
  model: string;
  status: "downloading" | "verifying" | "writing" | "complete";
  progress?: number;
  total?: number;
  completed?: string;
}

/**
 * Get Ollama server status with response time
 */
export async function getOllamaStatus(): Promise<OllamaStatus> {
  const start = Date.now();
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const data = (await response.json()) as { version?: string };
      return {
        status: "online",
        version: data.version,
        responseTime: Date.now() - start,
      };
    }
    return { status: "offline" };
  } catch {
    return { status: "offline" };
  }
}

/**
 * Get all installed models from Ollama
 */
export async function getInstalledModels(): Promise<OllamaModel[]> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: "GET",
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return [];
    }

    const data = (await response.json()) as {
      models?: Array<{
        name: string;
        size: number;
        modified_at: string;
        digest?: string;
      }>;
    };

    return (
      data.models?.map((model) => ({
        name: model.name,
        size: model.size,
        modifiedAt: model.modified_at,
        digest: model.digest,
      })) || []
    );
  } catch {
    return [];
  }
}

/**
 * Generate response using specified model
 */
export async function generateWithModel(
  model: string,
  prompt: string,
  options: Partial<GenerationOptions> = {}
): Promise<GenerationResult> {
  const startTime = Date.now();

  const requestBody: Record<string, unknown> = {
    model,
    prompt,
    stream: false,
    options: {
      temperature: options.temperature ?? 0.7,
      num_predict: options.maxTokens ?? 4096,
    },
  };

  if (options.system) {
    requestBody.system = options.system;
  }

  const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
    signal: AbortSignal.timeout(300000), // 5 minute timeout
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Ollama generation failed: ${error}`);
  }

  const data = (await response.json()) as {
    response?: string;
    done?: boolean;
    context?: number[];
    total_duration?: number;
    load_duration?: number;
    prompt_eval_count?: number;
    prompt_eval_duration?: number;
    eval_count?: number;
    eval_duration?: number;
    model?: string;
  };

  return {
    output: data.response || "",
    done: data.done ?? true,
    context: data.context,
    totalDuration: data.total_duration,
    loadDuration: data.load_duration,
    promptEvalCount: data.prompt_eval_count,
    promptEvalDuration: data.prompt_eval_duration,
    evalCount: data.eval_count,
    evalDuration: data.eval_duration,
    model: data.model,
  };
}

/**
 * Pull a model from Ollama registry
 */
export async function pullModel(
  modelName: string,
  onProgress?: (progress: PullProgress) => void
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/pull`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: modelName }),
    });

    if (!response.ok) {
      return { success: false, error: `Failed to pull model: ${response.statusText}` };
    }

    // For streaming responses, handle progress
    if (onProgress) {
      const reader = response.body?.getReader();
      if (reader) {
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.trim()) {
              try {
                const data = JSON.parse(line);
                onProgress({
                  model: modelName,
                  status: data.status || "downloading",
                  progress: data.progress,
                  total: data.total,
                  completed: data.completed,
                });
              } catch {
                // Skip invalid JSON
              }
            }
          }
        }
      }
    }

    onProgress?.({ model: modelName, status: "complete" });
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Estimate latency based on recent generations
 */
export async function estimateLatency(
  model: string,
  promptLength: number
): Promise<number> {
  // Simple estimation based on model and prompt length
  // In a real scenario, you'd track historical data
  const baseLatencyMs = 500;
  const charsPerSecond = 50;
  const estimatedGenerationTime = (promptLength / charsPerSecond) * 1000;

  return Math.round(baseLatencyMs + estimatedGenerationTime);
}

/**
 * Format model size to human readable format
 */
export function formatModelSize(bytes: number): string {
  const gb = bytes / (1024 * 1024 * 1024);
  if (gb >= 1) {
    return `${gb.toFixed(2)} GB`;
  }
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(0)} MB`;
}

/**
 * Extract model family from model name
 */
export function getModelFamily(modelName: string): string {
  const parts = modelName.split(":");
  if (parts.length >= 2) {
    return parts[0].split("-").pop() || parts[0];
  }
  return modelName.split("-")[0] || modelName;
}

/**
 * Validate that a model name is properly formatted
 */
export function isValidModelName(name: string): boolean {
  return /^[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+$/.test(name) ||
         /^[a-zA-Z0-9_-]+$/.test(name);
}

/**
 * Estimate token count for a given text
 * Simple approximation: ~4 characters per token
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Generate response using specified model (Streamed)
 */
export async function generateStream(
  model: string,
  prompt: string,
  options: Partial<GenerationOptions> = {}
): Promise<ReadableStream<Uint8Array> | null> {
  const requestBody: Record<string, unknown> = {
    model,
    prompt,
    stream: true,
    options: {
      temperature: options.temperature ?? 0.7,
      num_predict: options.maxTokens ?? 4096,
    },
  };

  if (options.system) {
    requestBody.system = options.system;
  }

  const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`Ollama stream generation failed: ${response.statusText}`);
  }

  return response.body;
}