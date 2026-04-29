import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getApiKeyByKey } from "@/lib/db";
import { estimateTokens } from "@/lib/utils-auth";
import { z } from "zod";

const chatSchema = z.object({
  model: z.string().optional(),
  prompt: z.string().min(1),
});

function extractApiKey(authHeader: string | null): string | null {
  if (!authHeader) return null;
  if (!authHeader.startsWith("Bearer ")) return null;
  return authHeader.substring(7);
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const apiKeyString = extractApiKey(authHeader);

    if (!apiKeyString) {
      return NextResponse.json(
        { error: "Missing or invalid Authorization header" },
        { status: 401 }
      );
    }

    // Get API key from database
    const apiKey = await getApiKeyByKey(apiKeyString);

    if (!apiKey) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401 }
      );
    }

    if (!apiKey.isActive) {
      return NextResponse.json(
        { error: "API key is disabled" },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { model, prompt } = chatSchema.parse(body);

    // Get settings and use default model if not provided
    const settings = await prisma.settings.findUnique({
      where: { id: "default" },
    });

    const selectedModel = model || settings?.defaultModel || "llama2";

    // Check rate limits
    const settings_data = settings;
    if (settings_data) {
      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);

      const recentLogs = await prisma.usageLog.count({
        where: {
          apiKeyId: apiKey.id,
          createdAt: { gte: oneMinuteAgo },
        },
      });

      if (recentLogs >= settings_data.maxRequestsPerMinute) {
        return NextResponse.json(
          { error: "Rate limit exceeded" },
          { status: 429 }
        );
      }

      // Check token limit
      if (
        settings_data.globalTokenCap &&
        apiKey.tokensUsed + estimateTokens(prompt) >
          settings_data.globalTokenCap
      ) {
        return NextResponse.json(
          { error: "Token limit exceeded" },
          { status: 429 }
        );
      }
    }

    // Call Ollama API
    const ollamaUrl =
      process.env.OLLAMA_API_URL || "http://localhost:11434";

    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: selectedModel,
        prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to generate response from Ollama" },
        { status: 500 }
      );
    }

    const ollamaResponse = await response.json();

    // Estimate tokens
    const promptTokens = estimateTokens(prompt);
    const completionTokens = estimateTokens(
      ollamaResponse.response || ""
    );
    const totalTokens = promptTokens + completionTokens;

    // Update API key stats
    await prisma.apiKey.update({
      where: { id: apiKey.id },
      data: {
        requestsCount: apiKey.requestsCount + 1,
        tokensUsed: apiKey.tokensUsed + totalTokens,
        lastUsedAt: new Date(),
      },
    });

    // Record usage log
    await prisma.usageLog.create({
      data: {
        apiKeyId: apiKey.id,
        promptTokens,
        completionTokens,
        totalTokens,
        model: selectedModel,
        endpoint: "/api/v1/chat",
      },
    });

    return NextResponse.json({
      success: true,
      model: selectedModel,
      output: ollamaResponse.response,
      usage: {
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: totalTokens,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    console.error("Chat API error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
