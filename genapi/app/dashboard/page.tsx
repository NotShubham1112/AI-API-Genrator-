import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Chart } from "@/components/dashboard/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Key, Activity, Zap, Clock, Server, Wifi } from "lucide-react";
import { getOllamaStatus } from "@/lib/utils-auth";

export default async function Dashboard() {
  await requireAuth();

  const apiKeys = await prisma.apiKey.findMany({
    where: { isActive: true },
  });

  const allApiKeys = await prisma.apiKey.findMany();

  const usageLogs = await prisma.usageLog.findMany({
    take: 30,
    orderBy: { createdAt: "desc" },
    include: { apiKey: { select: { name: true } } },
  });

  const settings = await prisma.settings.findUnique({
    where: { id: "default" },
  });

  const ollamaStatus = await getOllamaStatus();

  // Calculate stats
  const totalRequests = usageLogs.length;
  const totalTokensUsed = usageLogs.reduce((sum, log) => sum + log.totalTokens, 0);

  // Generate daily stats for charts
  const dailyStats: { [key: string]: { date: string; requests: number; tokens: number } } = {};
  
  usageLogs.forEach((log) => {
    const date = new Date(log.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    if (!dailyStats[date]) {
      dailyStats[date] = { date, requests: 0, tokens: 0 };
    }

    dailyStats[date].requests += 1;
    dailyStats[date].tokens += log.totalTokens;
  });

  const chartData = Object.values(dailyStats).reverse();

  // Stats cards
  const stats = [
    {
      title: "Total API Keys",
      value: allApiKeys.length,
      icon: Key,
      color: "text-blue-500",
    },
    {
      title: "Active Keys",
      value: apiKeys.length,
      icon: Activity,
      color: "text-green-500",
    },
    {
      title: "Total Requests",
      value: totalRequests,
      icon: Zap,
      color: "text-yellow-500",
    },
    {
      title: "Total Tokens Used",
      value: totalTokensUsed.toLocaleString(),
      icon: Clock,
      color: "text-purple-500",
    },
    {
      title: "Default Model",
      value: settings?.defaultModel || "N/A",
      icon: Server,
      color: "text-orange-500",
    },
    {
      title: "Ollama Status",
      value: ollamaStatus.status === "online" ? "Online" : "Offline",
      icon: Wifi,
      color: ollamaStatus.status === "online" ? "text-green-500" : "text-red-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-slate-400">
          Overview of your Local AI API Platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border-slate-700 bg-slate-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Chart
          data={chartData}
          title="Daily Token Usage"
          type="line"
          dataKey="tokens"
        />
        <Chart
          data={chartData}
          title="Requests by Day"
          type="bar"
          dataKey="requests"
        />
      </div>

      {/* Recent Activity */}
      <Card className="border-slate-700 bg-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {usageLogs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400">No activity yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-transparent">
                  <TableHead className="text-slate-400">Key</TableHead>
                  <TableHead className="text-slate-400">Model</TableHead>
                  <TableHead className="text-slate-400 text-right">
                    Tokens
                  </TableHead>
                  <TableHead className="text-slate-400 text-right">
                    Time
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usageLogs.slice(0, 5).map((log) => (
                  <TableRow key={log.id} className="border-slate-700">
                    <TableCell className="text-white">
                      {log.apiKey.name}
                    </TableCell>
                    <TableCell className="text-slate-300">{log.model}</TableCell>
                    <TableCell className="text-right text-slate-300">
                      {log.totalTokens}
                    </TableCell>
                    <TableCell className="text-right text-slate-400 text-xs">
                      {new Date(log.createdAt).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
