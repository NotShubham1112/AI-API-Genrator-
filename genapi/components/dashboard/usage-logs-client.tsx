"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  Activity, 
  Zap, 
  Clock,
  Search,
  TrendingUp,
  BarChart3,
  Calendar
} from "lucide-react";
import { toast } from "sonner";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, Line, LineChart, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface UsageLog {
  id: string;
  apiKey: { name: string };
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  endpoint: string;
  createdAt: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface StatsData {
  cards: {
    totalRequests: number;
    totalTokens: number;
    activeKeys: number;
    avgLatency: string;
  };
  chartData: Array<{ date: string; requests: number; tokens: number }>;
}

const chartConfig = {
  requests: {
    label: "Requests",
    color: "hsl(var(--primary))",
  },
  tokens: {
    label: "Tokens",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function UsageLogsClient() {
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 15,
    total: 0,
    pages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    model: "all",
    apiKeyId: "all",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    loadStats();
    loadLogs();
  }, [pagination.page, filters]);

  const loadStats = async () => {
    try {
      const response = await fetch("/api/usage-stats");
      const data = await response.json();
      setStats(data);
    } catch {
      toast.error("Failed to load analytics");
    }
  };

  const loadLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.search && { search: filters.search }),
      });
      const response = await fetch(`/api/usage-logs?${params}`);
      const data = await response.json();
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch {
      toast.error("Failed to load logs");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Usage</h1>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            Monitor your API consumption and processing trends in real-time.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border">
          <Button variant="ghost" size="sm" className="text-xs h-8 px-3 font-medium">24h</Button>
          <Button variant="secondary" size="sm" className="text-xs h-8 px-3 font-medium shadow-sm bg-white border">7d</Button>
          <Button variant="ghost" size="sm" className="text-xs h-8 px-3 font-medium">30d</Button>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground font-medium">Total Requests</span>
              <div className="p-1.5 rounded-md bg-blue-50 text-blue-600"><Activity className="size-3.5" /></div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold">{stats?.cards.totalRequests.toLocaleString() || "0"}</span>
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">+12%</span>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground font-medium">Tokens Processed</span>
              <div className="p-1.5 rounded-md bg-slate-50 text-slate-600"><Zap className="size-3.5" /></div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-bold">{stats?.cards.totalTokens.toLocaleString() || "0"}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground font-medium">Active Credentials</span>
              <div className="p-1.5 rounded-md bg-slate-50 text-slate-600"><TrendingUp className="size-3.5" /></div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-bold">{stats?.cards.activeKeys || "0"}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground font-medium">Avg. Latency</span>
              <div className="p-1.5 rounded-md bg-slate-50 text-slate-600"><Clock className="size-3.5" /></div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-bold">{stats?.cards.avgLatency || "0"}s</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visual Analytics */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader className="px-6 py-4 border-b">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="size-4 text-blue-600" /> Request Density
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ChartContainer config={chartConfig} className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.chartData}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-slate-200" />
                  <XAxis 
                    dataKey="date" 
                    tickLine={false} 
                    axisLine={false} 
                    tickMargin={12}
                    className="text-[10px] font-medium text-muted-foreground"
                    tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="requests" fill="var(--color-requests)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="px-6 py-4 border-b">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="size-4 text-blue-600" /> Processing Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ChartContainer config={chartConfig} className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.chartData}>
                  <defs>
                    <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-slate-200" />
                  <XAxis 
                    dataKey="date" 
                    tickLine={false} 
                    axisLine={false} 
                    tickMargin={12}
                    className="text-[10px] font-medium text-muted-foreground"
                    tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area 
                    type="monotone" 
                    dataKey="tokens" 
                    stroke="#2563eb" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorTokens)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Historical Logs */}
      <Card className="shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base font-semibold">Audit Logs</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">History of all API interactions.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                className="pl-9 w-[220px] h-9 text-xs bg-white"
                value={filters.search}
                onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
              />
            </div>
            <Button variant="outline" size="sm" className="h-9 text-xs bg-white">
              <Calendar className="mr-2 size-3.5 text-muted-foreground" /> Date
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-muted-foreground py-4 px-6">Timestamp</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground py-4 px-6">Identity</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground py-4 px-6">Model</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground py-4 px-6 text-right">Tokens</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground py-4 px-6 text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5} className="h-14 animate-pulse bg-slate-50/50" />
                  </TableRow>
                ))
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center text-muted-foreground text-sm py-12">
                    No logs found for this period.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="text-xs font-mono text-muted-foreground py-4 px-6">
                      {new Date(log.createdAt).toLocaleString("en-US", {
                        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                      })}
                    </TableCell>
                    <TableCell className="text-sm font-semibold py-4 px-6">{log.apiKey.name}</TableCell>
                    <TableCell className="py-4 px-6">
                      <Badge variant="outline" className="text-[10px] font-medium bg-slate-50 border-slate-200 px-2 h-5">
                        {log.model}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-xs font-mono font-bold py-4 px-6">
                      {log.totalTokens.toLocaleString()}
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center justify-center gap-1.5 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100 mx-auto w-fit">
                        <div className="size-1 rounded-full bg-emerald-600" />
                        Success
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        <div className="flex items-center justify-between px-6 py-4 border-t bg-slate-50/50">
          <div className="text-xs text-muted-foreground font-medium">
            Showing <span className="text-foreground">{logs.length}</span> of <span className="text-foreground">{pagination.total}</span> entries
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs px-3 bg-white"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="size-3.5 mr-1" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs px-3 bg-white"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
            >
              Next <ChevronRight className="size-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
