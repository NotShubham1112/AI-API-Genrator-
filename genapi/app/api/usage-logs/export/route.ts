import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const logs = await prisma.usageLog.findMany({
      include: {
        apiKey: {
          select: {
            name: true,
          }
        }
      },
      orderBy: {
        createdAt: "desc",
      }
    });

    const exportData = logs.map(log => ({
      id: log.id,
      apiKey: log.apiKey.name,
      model: log.model,
      promptTokens: log.promptTokens,
      completionTokens: log.completionTokens,
      totalTokens: log.totalTokens,
      endpoint: log.endpoint,
      timestamp: log.createdAt,
    }));

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": "attachment; filename=usage-logs-export.json",
      },
    });
  } catch (error) {
    console.error("Failed to export logs:", error);
    return NextResponse.json({ error: "Failed to export logs" }, { status: 500 });
  }
}
