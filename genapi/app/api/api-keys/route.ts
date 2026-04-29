import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateApiKey, maskApiKey } from "@/lib/utils-auth";
import { z } from "zod";

const createKeySchema = z.object({
  name: z.string().min(1),
  tokenLimit: z.number().positive().optional().nullable(),
  requestLimit: z.number().positive().optional().nullable(),
  allowedModels: z.array(z.string()).optional(),
  defaultModel: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const keys = await prisma.apiKey.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        key: true,
        isActive: true,
        tokenLimit: true,
        requestLimit: true,
        allowedModels: true,
        defaultModel: true,
        requestsCount: true,
        tokensUsed: true,
        lastUsedAt: true,
        createdAt: true,
      },
    });

    const maskedKeys = keys.map((key) => ({
      ...key,
      key: maskApiKey(key.key),
    }));

    return NextResponse.json(maskedKeys);
  } catch (error) {
    console.error("Failed to fetch API keys:", error);
    return NextResponse.json(
      { error: "Failed to fetch API keys" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, tokenLimit, requestLimit, allowedModels, defaultModel } = createKeySchema.parse(body);

    const key = generateApiKey();

    const newKey = await prisma.apiKey.create({
      data: {
        name,
        key,
        tokenLimit: tokenLimit || null,
        requestLimit: requestLimit || null,
        allowedModels: allowedModels ? allowedModels.join(",") : "all",
        defaultModel: defaultModel || null,
      },
    });

    return NextResponse.json({
      id: newKey.id,
      name: newKey.name,
      key: newKey.key,
      isActive: newKey.isActive,
      tokenLimit: newKey.tokenLimit,
      message: "API Key created successfully. Copy it now - you won't see it again!",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.flatten() },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create API key" },
      { status: 500 }
    );
  }
}
