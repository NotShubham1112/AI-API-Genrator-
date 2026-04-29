import { NextRequest, NextResponse } from "next/server";
import { generateWithModel, estimateTokens } from "@/lib/ollama";
import { prisma } from "@/lib/db";

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

    const startTime = Date.now();
    const result = await generateWithModel(model, prompt, {
      temperature,
      maxTokens,
      system,
    });

    const latency = (Date.now() - startTime) / 1000; // in seconds

    // Estimate tokens
    const promptTokens = estimateTokens(prompt);
    const completionTokens = estimateTokens(result.output);
    const totalTokens = promptTokens + completionTokens;

    // Log generation to database
    const log = await prisma.generationLog.create({
      data: {
        model,
        prompt: prompt.substring(0, 10000), // Store first 10k chars
        output: result.output.substring(0, 10000),
        tokens: totalTokens,
        latency,
      },
    });

    return NextResponse.json({
      success: true,
      output: result.output,
      latency: `${latency.toFixed(2)}s`,
      tokens: {
        prompt: promptTokens,
        completion: completionTokens,
        total: totalTokens,
      },
      logId: log.id,
      model: result.model,
    });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}