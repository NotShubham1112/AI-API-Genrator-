import { NextRequest, NextResponse } from "next/server";
import { estimateTokens } from "@/lib/utils-auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { model, prompt } = body;

    if (!model || !prompt) {
      return NextResponse.json(
        { error: "Model and prompt are required" },
        { status: 400 }
      );
    }

    const ollamaUrl = process.env.OLLAMA_API_URL || "http://localhost:11434";
    const startTime = Date.now();

    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
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

    const data = await response.json();
    const latency = Date.now() - startTime;

    const promptTokens = estimateTokens(prompt);
    const responseTokens = estimateTokens(
      data.response || ""
    );

    return NextResponse.json({
      success: true,
      output: data.response,
      latency: `${latency}ms`,
      usage: {
        prompt_tokens: promptTokens,
        completion_tokens: responseTokens,
        total_tokens: promptTokens + responseTokens,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to test model" },
      { status: 500 }
    );
  }
}
