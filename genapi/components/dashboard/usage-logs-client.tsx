"use client";

import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

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

export function UsageLogsClient() {
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 20,
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
    loadLogs();
  }, [pagination.page, filters]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.model !== "all" && { model: filters.model }),
        ...(filters.apiKeyId !== "all" && { apiKeyId: filters.apiKeyId }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      });

      const response = await fetch(`/api/usage-logs?${params}`);
      const data = await response.json();

      setLogs(data.logs);
      setPagination(data.pagination);
    } catch {
      toast.error("Failed to load usage logs");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  };

  const handleReset = () => {
    setFilters({
      search: "",
      model: "all",
      apiKeyId: "all",
      startDate: "",
      endDate: "",
    });
    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Usage Logs</h1>
        <p className="mt-1 text-slate-400">
          Track API usage and token consumption
        </p>
      </div>

      {/* Filters */}
      <Card className="border-slate-700 bg-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="text-sm text-slate-400">Search by Key</label>
              <Input
                placeholder="Search..."
                value={filters.search}
                onChange={(e) =>
                  handleFilterChange("search", e.target.value)
                }
                className="border-slate-600 bg-slate-700 text-white"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400">Model</label>
              <Select
                value={filters.model || "all"}
                onValueChange={(value) =>
                  handleFilterChange("model", value || "all")
                }
              >
                <SelectTrigger className="border-slate-600 bg-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-slate-600 bg-slate-700">
                  <SelectItem value="all">All Models</SelectItem>
                  <SelectItem value="llama2">Llama 2</SelectItem>
                  <SelectItem value="llama3">Llama 3</SelectItem>
                  <SelectItem value="mistral">Mistral</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-slate-400">Start Date</label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  handleFilterChange("startDate", e.target.value)
                }
                className="border-slate-600 bg-slate-700 text-white"
              />
            </div>

            <div>
              <label className="text-sm text-slate-400">End Date</label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  handleFilterChange("endDate", e.target.value)
                }
                className="border-slate-600 bg-slate-700 text-white"
              />
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleReset}
                className="w-full bg-slate-600 hover:bg-slate-700"
              >
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card className="border-slate-700 bg-slate-800">
        <CardHeader>
          <CardTitle className="text-white">
            Usage Logs ({pagination.total} total)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center">
              <p className="text-slate-400">Loading...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-slate-400">No usage logs found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700 hover:bg-transparent">
                      <TableHead className="text-slate-400">Date</TableHead>
                      <TableHead className="text-slate-400">API Key</TableHead>
                      <TableHead className="text-slate-400">Model</TableHead>
                      <TableHead className="text-right text-slate-400">
                        Prompt Tokens
                      </TableHead>
                      <TableHead className="text-right text-slate-400">
                        Completion Tokens
                      </TableHead>
                      <TableHead className="text-right text-slate-400">
                        Total Tokens
                      </TableHead>
                      <TableHead className="text-slate-400">Endpoint</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id} className="border-slate-700">
                        <TableCell className="text-slate-300">
                          {new Date(log.createdAt).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell className="font-medium text-white">
                          {log.apiKey.name}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {log.model}
                        </TableCell>
                        <TableCell className="text-right text-slate-300">
                          {log.promptTokens}
                        </TableCell>
                        <TableCell className="text-right text-slate-300">
                          {log.completionTokens}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-blue-400">
                          {log.totalTokens}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {log.endpoint}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-slate-400">
                  Page {pagination.page} of {pagination.pages} (
                  {pagination.total} total logs)
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() =>
                      handlePageChange(Math.max(1, pagination.page - 1))
                    }
                    disabled={pagination.page === 1}
                    className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() =>
                      handlePageChange(
                        Math.min(pagination.pages, pagination.page + 1)
                      )
                    }
                    disabled={pagination.page === pagination.pages}
                    className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
