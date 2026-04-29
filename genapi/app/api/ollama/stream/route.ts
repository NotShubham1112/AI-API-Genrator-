import { NextRequest, NextResponse } from "next/server";
import { generateStream } from "@/lib/ollama";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { model, prompt, temperature, maxTokens, system } = body;

    if (!model || !prompt) {
      return NextResponse.json(
        { error: "Model and prompt are required" },
        { status: 400 }
      );
    }

    // Validate prompt length
    if (prompt.length > 100000) {
      return NextResponse.json(
        { error: "Prompt exceeds maximum length of 100,000 characters" },
        { status: 400 }
      );
    }

    const stream = await generateStream(model, prompt, {
      temperature,
      maxTokens,
      system,
    });

    if (!stream) {
      return NextResponse.json(
        { error: "Failed to initialize stream" },
        { status: 500 }
      );
    }

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Streaming error:", error);
    return NextResponse.json(
      { error: "Failed to generate response stream" },
      { status: 500 }
    );
  }
}
