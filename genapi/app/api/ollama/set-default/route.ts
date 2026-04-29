import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { model } = body;

    await prisma.settings.update({
      where: { id: "default" },
      data: { defaultModel: model },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to set default model" },
      { status: 500 }
    );
  }
}
