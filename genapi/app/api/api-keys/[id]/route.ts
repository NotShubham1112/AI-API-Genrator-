import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, ...data } = body;

    if (action === "disable") {
      await prisma.apiKey.update({
        where: { id },
        data: { isActive: false },
      });
      return NextResponse.json({ success: true });
    }

    if (action === "enable") {
      await prisma.apiKey.update({
        where: { id },
        data: { isActive: true },
      });
      return NextResponse.json({ success: true });
    }

    if (action === "reset-stats") {
      await prisma.apiKey.update({
        where: { id },
        data: {
          requestsCount: 0,
          tokensUsed: 0,
          lastUsedAt: null,
        },
      });
      return NextResponse.json({ success: true });
    }

    if (action === "rename") {
      await prisma.apiKey.update({
        where: { id },
        data: { name: data.name },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch {
    return NextResponse.json(
      { error: "Failed to update API key" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    await prisma.apiKey.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete API key" },
      { status: 500 }
    );
  }
}
