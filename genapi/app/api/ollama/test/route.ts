import { NextRequest, NextResponse } from "next/server";
import { generateWithModel, estimateTokens } from "@/lib/ollama";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { model, prompt, temperature, maxTokens } = body;

    if (!model || !prompt) {
      return NextResponse.json(
        { error: "Model and prompt are required" },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    const result = await generateWithModel(model, prompt, {
      temperature,
      maxTokens,
    });

    const latency = Date.now() - startTime;
    const promptTokens = estimateTokens(prompt);
    const responseTokens = estimateTokens(result.output);

    return NextResponse.json({
      success: true,
      output: result.output,
      latency: `${latency}ms`,
      latencySeconds: latency / 1000,
      usage: {
        prompt_tokens: promptTokens,
        completion_tokens: responseTokens,
        total_tokens: promptTokens + responseTokens,
      },
      model: result.model,
      evalCount: result.evalCount,
      evalDuration: result.evalDuration,
    });
  } catch (error) {
    console.error("Ollama test error:", error);
    return NextResponse.json(
      { error: "Failed to test model" },
      { status: 500 }
    );
  }
}