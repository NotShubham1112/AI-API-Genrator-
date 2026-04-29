import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { getOllamaStatus, getInstalledModels } from "@/lib/ollama";
import { Chart } from "@/components/dashboard/chart";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Key,
  Activity,
  Zap,
  Clock,
  Server,
  Wifi,
  Brain,
  TrendingUp,
  Gauge,
} from "lucide-react";

export default async function Dashboard() {
  await requireAuth();

  // Fetch all data in parallel
  const [
    apiKeys,
    allApiKeys,
    usageLogs,
    settings,
    ollamaStatus,
    models,
    generationLogs,
  ] = await Promise.all([
    prisma.apiKey.findMany({ where: { isActive: true } }),
    prisma.apiKey.findMany(),
    prisma.usageLog.findMany({
      take: 30,
      orderBy: { createdAt: "desc" },
      include: { apiKey: { select: { name: true } } },
    }),
    prisma.settings.findUnique({ where: { id: "default" } }),
    getOllamaStatus(),
    getInstalledModels(),
    prisma.generationLog.findMany({ take: 50, orderBy: { createdAt: "desc" } }),
  ]);

  // Calculate stats
  const totalRequests = usageLogs.length;
  const totalTokensUsed = usageLogs.reduce((sum, log) => sum + log.totalTokens, 0);

  // Generation stats
  const totalGenerations = generationLogs.length;
  const totalGenerationTokens = generationLogs.reduce((sum, log) => sum + log.tokens, 0);
  const avgLatency = totalGenerations > 0
    ? (generationLogs.reduce((sum, log) => sum + log.latency, 0) / totalGenerations).toFixed(2)
    : "0";

  // Generate daily stats for charts (from usage logs)
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

  // Generation daily stats
  const genDailyStats: { [key: string]: { date: string; generations: number; tokens: number } } = {};

  generationLogs.forEach((log) => {
    const date = new Date(log.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    if (!genDailyStats[date]) {
      genDailyStats[date] = { date, generations: 0, tokens: 0 };
    }

    genDailyStats[date].generations += 1;
    genDailyStats[date].tokens += log.tokens;
  });

  const usageChartData = Object.values(dailyStats).reverse();
  const genChartData = Object.values(genDailyStats).reverse();

  // Model usage stats (from generation logs)
  const modelUsage: { [key: string]: { model: string; tokens: number; count: number } } = {};

  generationLogs.forEach((log) => {
    if (!modelUsage[log.model]) {
      modelUsage[log.model] = { model: log.model, tokens: 0, count: 0 };
    }
    modelUsage[log.model].tokens += log.tokens;
    modelUsage[log.model].count += 1;
  });

  const modelStatsData = Object.values(modelUsage);

  // Stats cards
  const stats = [
    {
      title: "Ollama Status",
      value: ollamaStatus.status === "online" ? "Online" : "Offline",
      icon: Wifi,
      color: ollamaStatus.status === "online" ? "text-green-500" : "text-red-500",
      badge: ollamaStatus.status === "online" ? "online" : "offline",
    },
    {
      title: "Installed Models",
      value: models.length,
      icon: Brain,
      color: "text-purple-500",
    },
    {
      title: "Selected Model",
      value: settings?.defaultModel || "None",
      icon: Server,
      color: "text-blue-500",
    },
    {
      title: "Total Generations",
      value: totalGenerations.toLocaleString(),
      icon: Zap,
      color: "text-yellow-500",
    },
    {
      title: "Avg Latency",
      value: `${avgLatency}s`,
      icon: Gauge,
      color: "text-cyan-500",
    },
    {
      title: "Total Gen Tokens",
      value: totalGenerationTokens.toLocaleString(),
      icon: TrendingUp,
      color: "text-emerald-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-slate-400">
          Overview of your Local AI Platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  {stat.badge && (
                    <Badge
                      variant="outline"
                      className={`${
                        stat.badge === "online"
                          ? "border-green-600 bg-green-950 text-green-400"
                          : "border-red-600 bg-red-950 text-red-400"
                      }`}
                    >
                      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                        stat.badge === "online" ? "bg-green-500" : "bg-red-500"
                      }`} />
                      {stat.badge}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Chart
          data={genChartData}
          title="Daily Generations"
          type="bar"
          dataKey="generations"
        />
        <Chart
          data={genChartData}
          title="Token Usage by Day"
          type="line"
          dataKey="tokens"
        />
      </div>

      {/* Model Usage & Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Model Stats */}
        <Card className="border-slate-700 bg-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Model Usage</CardTitle>
          </CardHeader>
          <CardContent>
            {modelStatsData.length === 0 ? (
              <div className="text-center py-8">
                <Brain className="mx-auto h-10 w-10 text-slate-600" />
                <p className="mt-3 text-slate-400">No generation data yet</p>
                <p className="text-sm text-slate-500">Start using the Generate page</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-transparent">
                    <TableHead className="text-slate-400">Model</TableHead>
                    <TableHead className="text-slate-400 text-right">Generations</TableHead>
                    <TableHead className="text-slate-400 text-right">Tokens</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modelStatsData.map((stat) => (
                    <TableRow key={stat.model} className="border-slate-700">
                      <TableCell className="font-medium text-blue-400">
                        {stat.model}
                      </TableCell>
                      <TableCell className="text-right text-slate-300">
                        {stat.count.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-slate-300">
                        {stat.tokens.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-slate-700 bg-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {generationLogs.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="mx-auto h-10 w-10 text-slate-600" />
                <p className="mt-3 text-slate-400">No recent activity</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-transparent">
                    <TableHead className="text-slate-400">Model</TableHead>
                    <TableHead className="text-slate-400 text-right">Tokens</TableHead>
                    <TableHead className="text-slate-400 text-right">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {generationLogs.slice(0, 5).map((log) => (
                    <TableRow key={log.id} className="border-slate-700">
                      <TableCell className="font-medium text-blue-400">
                        {log.model}
                      </TableCell>
                      <TableCell className="text-right text-slate-300">
                        {log.tokens.toLocaleString()}
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

      {/* Quick Actions */}
      <Card className="border-slate-700 bg-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-slate-700/50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/20">
                  <Zap className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Generate</p>
                  <p className="text-sm text-slate-400">Create AI responses</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-slate-700/50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600/20">
                  <Brain className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Models</p>
                  <p className="text-sm text-slate-400">{models.length} installed</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-slate-700/50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600/20">
                  <Server className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-white">API Keys</p>
                  <p className="text-sm text-slate-400">{apiKeys.length} active</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}