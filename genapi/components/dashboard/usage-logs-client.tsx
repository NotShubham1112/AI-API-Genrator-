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
    <div className="max-w-[1200px] mx-auto space-y-6 py-6 px-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Usage Telemetry</h1>
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest opacity-50 mt-1">Real-time system consumption metrics.</p>
        </div>
        <div className="flex items-center gap-1 bg-muted/20 p-1 rounded-lg border border-border/40">
           <Button variant="ghost" size="sm" className="text-[10px] h-8 px-4 font-black uppercase tracking-widest">24h</Button>
           <Button variant="secondary" size="sm" className="text-[10px] h-8 px-4 font-black uppercase tracking-widest shadow-sm">7d</Button>
           <Button variant="ghost" size="sm" className="text-[10px] h-8 px-4 font-black uppercase tracking-widest">30d</Button>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/60 bg-card/40 shadow-sm rounded-xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
               <div className="p-1.5 rounded-lg bg-primary/10 text-primary"><Activity className="size-4" /></div>
               <Badge variant="outline" className="text-[10px] font-mono border-green-500/20 text-green-500 bg-green-500/5 px-2 py-0.5">+12%</Badge>
            </div>
            <div className="text-2xl font-black tracking-tighter tabular-nums">{stats?.cards.totalRequests.toLocaleString() || "0"}</div>
            <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mt-1 opacity-60">Requests</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/40 shadow-sm rounded-xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
               <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500"><Zap className="size-4" /></div>
               <Badge variant="outline" className="text-[10px] font-mono border-blue-500/20 text-blue-500 bg-blue-500/5 px-2 py-0.5">Peak</Badge>
            </div>
            <div className="text-2xl font-black tracking-tighter tabular-nums">{stats?.cards.totalTokens.toLocaleString() || "0"}</div>
            <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mt-1 opacity-60">Tokens</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/40 shadow-sm rounded-xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
               <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-500"><TrendingUp className="size-4" /></div>
               <Badge variant="outline" className="text-[10px] font-mono border-orange-500/20 text-orange-500 bg-orange-500/5 px-2 py-0.5">Active</Badge>
            </div>
            <div className="text-2xl font-black tracking-tighter tabular-nums">{stats?.cards.activeKeys || "0"}</div>
            <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mt-1 opacity-60">Active Keys</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/40 shadow-sm rounded-xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
               <div className="p-1.5 rounded-lg bg-muted-foreground/10 text-muted-foreground"><Clock className="size-4" /></div>
               <Badge variant="outline" className="text-[10px] font-mono border-border text-muted-foreground px-2 py-0.5">Stable</Badge>
            </div>
            <div className="text-2xl font-black tracking-tighter tabular-nums">{stats?.cards.avgLatency || "0"}s</div>
            <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mt-1 opacity-60">Latency</p>
          </CardContent>
        </Card>
      </div>

      {/* Visual Analytics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/60 bg-card/40 rounded-xl">
          <CardHeader className="p-5 pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
               <BarChart3 className="size-4 text-primary" /> Request Density
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.chartData}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted/20" />
                  <XAxis 
                    dataKey="date" 
                    tickLine={false} 
                    axisLine={false} 
                    tickMargin={10}
                    className="text-[10px] font-bold text-muted-foreground"
                    tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="requests" fill="var(--color-requests)" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/40 rounded-xl">
          <CardHeader className="p-5 pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
               <Activity className="size-4 text-primary" /> Processing Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.chartData}>
                  <defs>
                    <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-tokens)" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="var(--color-tokens)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted/20" />
                  <XAxis 
                    dataKey="date" 
                    tickLine={false} 
                    axisLine={false} 
                    tickMargin={10}
                    className="text-[10px] font-bold text-muted-foreground"
                    tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area 
                    type="monotone" 
                    dataKey="tokens" 
                    stroke="var(--color-tokens)" 
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

      {/* Compact Historical Logs */}
      <Card className="border-border/60 bg-card/40 overflow-hidden rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between p-5 border-b border-border/40 bg-muted/10">
          <div className="space-y-1">
            <CardTitle className="text-base font-black uppercase tracking-tight">Audit Logs</CardTitle>
            <CardDescription className="text-[10px] uppercase font-black tracking-widest opacity-40">System history.</CardDescription>
          </div>
          <div className="flex items-center gap-3">
             <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search keys..."
                  className="pl-9 w-[200px] h-10 text-xs bg-background border-border/60"
                  value={filters.search}
                  onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                />
             </div>
             <Button variant="outline" size="sm" className="h-10 text-xs font-black uppercase border-border/60 bg-background px-4">
                <Calendar className="mr-2 size-4" /> Date
             </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/5">
              <TableRow className="hover:bg-transparent border-border/40">
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground h-12 px-5">Timestamp</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground h-12 px-5">Key</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground h-12 px-5">Engine</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground h-12 px-5 text-right">Tokens</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground h-12 px-5 text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i} className="border-border/10">
                    <TableCell colSpan={5} className="h-12 animate-pulse bg-muted/5" />
                  </TableRow>
                ))
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center text-muted-foreground italic text-xs">
                    No telemetry data found.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} className="group hover:bg-muted/20 transition-colors border-border/10">
                    <TableCell className="text-[11px] font-mono text-muted-foreground px-5 py-3">
                      {new Date(log.createdAt).toLocaleString("en-US", {
                        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                      })}
                    </TableCell>
                    <TableCell className="font-black text-xs tracking-tight px-5 py-3">{log.apiKey.name}</TableCell>
                    <TableCell className="px-5 py-3">
                       <Badge variant="outline" className="text-[10px] font-mono bg-muted/20 border-border/40 px-2 py-0.5">
                          {log.model}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right text-xs font-mono font-bold tabular-nums px-5 py-3">
                       {log.totalTokens.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center px-5 py-3">
                      <div className="flex items-center justify-center gap-1.5 text-[10px] font-black text-green-500 bg-green-500/5 px-2 py-1 rounded-full border border-green-500/10">
                        <div className="size-1.5 rounded-full bg-green-500" />
                        OK
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          <div className="flex items-center justify-between p-4 border-t border-border/40 bg-muted/5">
            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Entries: <span className="text-foreground">{pagination.total}</span> | P. {pagination.page} / {pagination.pages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs px-4 font-black border-border/60"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                <ChevronLeft className="size-4 mr-1.5" /> Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs px-4 font-black border-border/60"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
              >
                Next <ChevronRight className="size-4 ml-1.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
