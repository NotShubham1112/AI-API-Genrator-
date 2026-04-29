import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { startOfDay, subDays, format } from "date-fns";

export async function GET() {
  try {
    const today = new Date();
    const last30Days = subDays(today, 30);

    // Fetch usage logs from last 30 days
    const logs = await prisma.usageLog.findMany({
      where: {
        createdAt: {
          gte: last30Days,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Fetch generation logs for latency
    const genLogs = await prisma.generationLog.findMany({
      where: {
        createdAt: {
          gte: last30Days,
        },
      },
    });

    // Fetch active keys
    const activeKeysCount = await prisma.apiKey.count({
      where: { isActive: true },
    });

    // Aggregate daily stats
    const dailyStats: Record<string, { date: string; requests: number; tokens: number }> = {};
    
    // Initialize last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = format(subDays(today, i), "MMM dd");
      dailyStats[date] = { date, requests: 0, tokens: 0 };
    }

    logs.forEach((log) => {
      const date = format(log.createdAt, "MMM dd");
      if (dailyStats[date]) {
        dailyStats[date].requests += 1;
        dailyStats[date].tokens += log.totalTokens;
      }
    });

    const totalRequests = logs.length;
    const totalTokens = logs.reduce((sum, log) => sum + log.totalTokens, 0);
    const avgLatency = genLogs.length > 0 
      ? genLogs.reduce((sum, log) => sum + log.latency, 0) / genLogs.length 
      : 0;

    return NextResponse.json({
      cards: {
        totalRequests,
        totalTokens,
        activeKeys: activeKeysCount,
        avgLatency: avgLatency.toFixed(2),
      },
      chartData: Object.values(dailyStats),
    });
  } catch (error) {
    console.error("Failed to fetch usage stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
