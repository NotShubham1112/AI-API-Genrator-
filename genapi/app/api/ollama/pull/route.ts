import { NextRequest, NextResponse } from "next/server";
import { pullModel } from "@/lib/ollama";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { model } = body;

    if (!model) {
      return NextResponse.json(
        { error: "Model name is required" },
        { status: 400 }
      );
    }

    // Start pulling the model
    const result = await pullModel(model);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to pull model" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Model ${model} pulled successfully`,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to pull model" },
      { status: 500 }
    );
  }
}