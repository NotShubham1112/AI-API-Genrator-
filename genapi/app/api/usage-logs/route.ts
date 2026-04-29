import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const apiKeyId = searchParams.get("apiKeyId");
    const model = searchParams.get("model");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;

    const where: any = {};

    if (apiKeyId && apiKeyId !== "all") {
      where.apiKeyId = apiKeyId;
    }

    if (model && model !== "all") {
      where.model = model;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    if (search) {
      where.apiKey = { name: { contains: search } };
    }

    const [logs, total] = await Promise.all([
      prisma.usageLog.findMany({
        where,
        include: { apiKey: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.usageLog.count({ where }),
    ]);

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Failed to fetch usage logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage logs" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    await prisma.usageLog.deleteMany({});
    return NextResponse.json({ message: "All logs cleared successfully" });
  } catch (error) {
    console.error("Failed to clear logs:", error);
    return NextResponse.json(
      { error: "Failed to clear usage logs" },
      { status: 500 }
    );
  }
}
