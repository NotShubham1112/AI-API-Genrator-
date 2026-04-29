import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateApiKey(): string {
  const randomPart = Math.random().toString(36).substring(2, 20) +
    Math.random().toString(36).substring(2, 20);
  return `sk_local_${randomPart}`;
}

export function maskApiKey(key: string): string {
  if (key.length <= 8) return key;
  return key.substring(0, 8) + "*".repeat(key.length - 12) + key.slice(-4);
}

/**
 * Estimate token count for a given text
 * Simple approximation: ~4 characters per token
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Get Ollama status by checking the API endpoint
 */
export async function getOllamaStatus(): Promise<{
  status: "online" | "offline";
  version?: string;
}> {
  try {
    const response = await fetch(
      process.env.OLLAMA_API_URL + "/api/tags" || "http://localhost:11434/api/tags",
      { method: "GET" }
    );
    if (response.ok) {
      return { status: "online" };
    }
    return { status: "offline" };
  } catch {
    return { status: "offline" };
  }
}

/**
 * Get installed models from Ollama
 */
export async function getInstalledModels(): Promise<
  Array<{ name: string; size: number; modifiedAt: string }>
> {
  try {
    const response = await fetch(
      process.env.OLLAMA_API_URL + "/api/tags" || "http://localhost:11434/api/tags",
      { method: "GET" }
    );

    if (!response.ok) {
      return [];
    }

    const data = (await response.json()) as {
      models?: Array<{
        name: string;
        size: number;
        modified_at: string;
      }>;
    };

    return (
      data.models?.map((model) => ({
        name: model.name,
        size: model.size,
        modifiedAt: model.modified_at,
      })) || []
    );
  } catch {
    return [];
  }
}
