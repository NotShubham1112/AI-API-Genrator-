import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const settingsSchema = z.object({
  defaultModel: z.string().optional(),
  maxRequestsPerMinute: z.number().positive().optional(),
  globalTokenCap: z.number().positive().nullable().optional(),
  autoDisableAbuseKeys: z.boolean().optional(),
});

export async function GET() {
  try {
    const settings = await prisma.settings.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      return NextResponse.json({ error: "Settings not found" }, { status: 404 });
    }

    return NextResponse.json(settings);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const data = settingsSchema.parse(body);

    const settings = await prisma.settings.update({
      where: { id: "default" },
      data,
    });

    return NextResponse.json(settings);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
