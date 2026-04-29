"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  RefreshCw,
  Search,
  Star,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Wifi,
  Download,
  Trash2,
  Play,
  ChevronDown,
} from "lucide-react";

type SortKey = "name" | "size" | "latest";

interface Model {
  name: string;
  size: number;
  modifiedAt: string;
}

interface ModelStats {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

interface TestResult {
  output: string;
  latency: string;
  usage: ModelStats;
}

const POPULAR_MODELS = [
  { name: "llama3.2", label: "Llama 3.2", description: "General purpose" },
  { name: "llama3.2:1b", label: "Llama 3.2 1B", description: "Lightweight" },
  { name: "mistral", label: "Mistral", description: "Fast & efficient" },
  { name: "deepseek-r1", label: "DeepSeek R1", description: "Reasoning" },
  { name: "codellama", label: "Code Llama", description: "Code generation" },
  { name: "phi3", label: "Phi-3", description: "Microsoft's model" },
];

export function ModelsClient() {
  const [models, setModels] = useState<Model[]>([]);
  const [status, setStatus] = useState<"online" | "offline">("offline");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [defaultModel, setDefaultModel] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("latest");

  // Test functionality
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [testPrompt, setTestPrompt] = useState("");
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  // Pull functionality
  const [pullingModel, setPullingModel] = useState<string | null>(null);
  const [showPullMenu, setShowPullMenu] = useState(false);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const response = await fetch("/api/ollama/models");
      const data = await response.json();

      setStatus(data.status);
      setModels(data.models || []);

      // Load default model
      const settingsRes = await fetch("/api/ollama/set-default");
      const settings = await settingsRes.json();
      setDefaultModel(settings.defaultModel);

      if (data.models?.length > 0 && !selectedModel) {
        const exists = data.models.some((m: Model) => m.name === settings.defaultModel);
        setSelectedModel(exists ? settings.defaultModel : data.models[0].name);
      }
    } catch {
      toast.error("Failed to load models");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSetDefault = async (model: string) => {
    try {
      const response = await fetch("/api/ollama/set-default", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model }),
      });

      if (!response.ok) throw new Error("Failed");

      setDefaultModel(model);
      toast.success(`"${model}" set as default`);
    } catch {
      toast.error("Failed to set default model");
    }
  };

  const handleTestModel = async () => {
    if (!selectedModel || !testPrompt.trim()) {
      toast.error("Select a model and enter a prompt");
      return;
    }

    setTestLoading(true);
    setTestResult(null);

    try {
      const response = await fetch("/api/ollama/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel,
          prompt: testPrompt,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Test failed");
        return;
      }

      setTestResult(data);
      toast.success("Test complete");
    } catch {
      toast.error("Failed to test model");
    } finally {
      setTestLoading(false);
    }
  };

  const handlePullModel = async (modelName: string) => {
    setPullingModel(modelName);
    setShowPullMenu(false);

    try {
      const response = await fetch("/api/ollama/pull", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: modelName }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Pull failed");
      }

      toast.success(`${modelName} installed successfully`);
      await loadModels(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to pull model");
    } finally {
      setPullingModel(null);
    }
  };

  const formatBytes = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return gb >= 1 ? `${gb.toFixed(2)} GB` : `${(bytes / 1024 / 1024).toFixed(0)} MB`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const filteredAndSortedModels = useMemo(() => {
    let filtered = models.filter((m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    switch (sortKey) {
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "size":
        filtered.sort((a, b) => b.size - a.size);
        break;
      case "latest":
      default:
        filtered.sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime());
    }

    return filtered;
  }, [models, searchQuery, sortKey]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-48" />
            <Skeleton className="mt-2 h-5 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Models</h1>
          <p className="mt-1 text-slate-400">
            Manage your local Ollama models
          </p>
        </div>

        <div className="flex items-center gap-3">
          {defaultModel && (
            <Badge variant="outline" className="border-blue-600 bg-blue-950 text-blue-400">
              <Star className="mr-1.5 h-3 w-3 fill-blue-400" />
              {defaultModel}
            </Badge>
          )}

          <div className="relative">
            <Button
              onClick={() => setShowPullMenu(!showPullMenu)}
              disabled={status === "offline" || pullingModel !== null}
              className="bg-green-600 hover:bg-green-700"
            >
              {pullingModel ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Installing...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Install Model
                </>
              )}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>

            {showPullMenu && (
              <div className="absolute right-0 z-10 mt-2 w-64 rounded-lg border border-slate-600 bg-slate-700 shadow-lg">
                <div className="p-2">
                  <p className="px-2 py-1 text-xs text-slate-400">Popular Models</p>
                  {POPULAR_MODELS.map((model) => {
                    const isInstalled = models.some((m) => m.name === model.name);
                    return (
                      <button
                        key={model.name}
                        onClick={() => handlePullModel(model.name)}
                        disabled={isInstalled}
                        className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left transition-colors hover:bg-slate-600 disabled:opacity-50"
                      >
                        <div>
                          <p className="font-medium text-white">{model.label}</p>
                          <p className="text-xs text-slate-400">{model.description}</p>
                        </div>
                        {isInstalled ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : (
                          <Download className="h-4 w-4 text-slate-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={() => loadModels(true)}
            disabled={refreshing}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Status Banner */}
      {status === "offline" ? (
        <Card className="border-red-900 bg-red-950">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="rounded-full bg-red-900 p-3">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-red-200">Ollama is offline</p>
              <p className="text-sm text-red-300/70">
                Start Ollama server:{" "}
                <code className="rounded bg-red-900/50 px-1.5 py-0.5 font-mono">
                  ollama serve
                </code>
              </p>
            </div>
            <Button
              onClick={() => loadModels(true)}
              variant="outline"
              className="border-red-700 text-red-300 hover:bg-red-900"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : models.length === 0 ? (
        <Card className="border-yellow-900 bg-yellow-950">
          <CardContent className="py-8">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-900/50">
                <Wifi className="h-8 w-8 text-yellow-400" />
              </div>
              <h3 className="mt-4 font-semibold text-yellow-200">No Models Installed</h3>
              <p className="mt-2 text-sm text-yellow-300/70">
                Pull your first model using the Install Model button above
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {["llama3.2", "mistral", "deepseek-r1"].map((model) => (
                  <Button
                    key={model}
                    onClick={() => handlePullModel(model)}
                    disabled={pullingModel !== null}
                    variant="outline"
                    className="border-yellow-700 text-yellow-300 hover:bg-yellow-900"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {model}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Badge variant="outline" className="border-green-600 bg-green-950 text-green-400">
          <span className="mr-1.5 h-2 w-2 rounded-full bg-green-500" />
          {models.length} model{models.length !== 1 ? "s" : ""} available
        </Badge>
      )}

      {/* Search and Sort */}
      {models.length > 0 && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search models..."
              className="pl-10 border-slate-600 bg-slate-700 text-white placeholder:text-slate-500"
            />
          </div>
          <Select
            value={sortKey}
            onValueChange={(value) => setSortKey(value as SortKey)}
          >
            <SelectTrigger className="w-40 border-slate-600 bg-slate-700 text-white">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent className="border-slate-600 bg-slate-700 text-white">
              <SelectItem value="latest">Latest Modified</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
              <SelectItem value="size">Size (Largest)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Models Grid */}
      {filteredAndSortedModels.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedModels.map((model) => (
            <Card
              key={model.name}
              className={`border-2 transition-all ${
                defaultModel === model.name
                  ? "border-blue-600 bg-slate-700/50"
                  : "border-slate-700 bg-slate-800 hover:border-slate-600"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg text-white">{model.name}</CardTitle>
                    {defaultModel === model.name && (
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className="border-green-600 bg-green-950 text-green-400"
                  >
                    <span className="mr-1 h-1.5 w-1.5 rounded-full bg-green-500" />
                    Ready
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-slate-500">Size</p>
                    <p className="text-sm font-semibold text-slate-200">
                      {formatBytes(model.size)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Modified</p>
                    <p className="text-sm text-slate-300">
                      {formatDate(model.modifiedAt)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  {defaultModel === model.name ? (
                    <Button
                      disabled
                      size="sm"
                      className="flex-1 bg-blue-600"
                    >
                      <CheckCircle className="mr-1.5 h-4 w-4" />
                      Default
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleSetDefault(model.name)}
                      size="sm"
                      className="flex-1 bg-slate-700 hover:bg-slate-600"
                    >
                      <Star className="mr-1.5 h-4 w-4" />
                      Set Default
                    </Button>
                  )}
                  <Button
                    onClick={() => {
                      setSelectedModel(model.name);
                      setTestPrompt("Explain what a neural network is in simple terms.");
                    }}
                    size="sm"
                    variant="outline"
                    className="border-slate-600 text-white hover:bg-slate-700"
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Test Panel */}
      {status === "online" && models.length > 0 && (
        <Card className="border-slate-700 bg-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Test Model</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex-1">
                <label className="text-sm text-slate-400">Selected Model</label>
                <p className="text-lg font-semibold text-blue-400">
                  {selectedModel || "None selected"}
                </p>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-400">Test Prompt</label>
              <textarea
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                placeholder="Enter a prompt to test the model..."
                className="w-full rounded-md border border-slate-600 bg-slate-700 px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-blue-500"
                rows={3}
              />
            </div>

            <Button
              onClick={handleTestModel}
              disabled={testLoading || !selectedModel || !testPrompt.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {testLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Run Test
                </>
              )}
            </Button>

            {testResult && (
              <div className="space-y-4 rounded-lg border border-slate-600 bg-slate-700/50 p-4">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <p className="text-xs text-slate-500">Latency</p>
                    <p className="text-lg font-semibold text-white">{testResult.latency}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Prompt Tokens</p>
                    <p className="text-lg font-semibold text-blue-400">
                      {testResult.usage.prompt_tokens.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Completion</p>
                    <p className="text-lg font-semibold text-green-400">
                      {testResult.usage.completion_tokens.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Total Tokens</p>
                    <p className="text-lg font-semibold text-purple-400">
                      {testResult.usage.total_tokens.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs text-slate-500">Output</p>
                  <div className="max-h-64 overflow-y-auto rounded-md bg-slate-600 p-4">
                    <pre className="whitespace-pre-wrap text-sm text-slate-200">
                      {testResult.output}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}