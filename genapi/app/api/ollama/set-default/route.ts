import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { model } = body;

    if (!model) {
      return NextResponse.json(
        { error: "Model name is required" },
        { status: 400 }
      );
    }

    // Upsert settings
    await prisma.settings.upsert({
      where: { id: "default" },
      update: { defaultModel: model },
      create: { id: "default", defaultModel: model },
    });

    return NextResponse.json({ success: true, defaultModel: model });
  } catch {
    return NextResponse.json(
      { error: "Failed to set default model" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const settings = await prisma.settings.findUnique({
      where: { id: "default" },
    });

    return NextResponse.json({
      defaultModel: settings?.defaultModel || "llama3.2",
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch default model" },
      { status: 500 }
    );
  }
}