"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Loader2,
  Sparkles,
  Copy,
  RefreshCw,
  Zap,
  Clock,
  ChevronDown,
  Settings2,
} from "lucide-react";

interface Model {
  name: string;
  size: number;
  modifiedAt: string;
}

interface GenerationResult {
  output: string;
  latency: string;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
}

export function GenerateClient() {
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [defaultModel, setDefaultModel] = useState<string>("");
  const [status, setStatus] = useState<"online" | "offline">("offline");
  const [loading, setLoading] = useState(true);

  // Generation state
  const [prompt, setPrompt] = useState("");
  const [temperature, setTemperature] = useState([0.7]);
  const [maxTokens, setMaxTokens] = useState<string>("2048");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);

  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [modelsRes, settingsRes] = await Promise.all([
        fetch("/api/ollama/models"),
        fetch("/api/ollama/set-default"),
      ]);

      const modelsData = await modelsRes.json();
      const settingsData = await settingsRes.json();

      setStatus(modelsData.status);
      setModels(modelsData.models || []);
      setDefaultModel(settingsData.defaultModel);

      if (modelsData.models?.length > 0 && !selectedModel) {
        const defaultM = settingsData.defaultModel;
        const exists = modelsData.models.some((m: Model) => m.name === defaultM);
        setSelectedModel(exists ? defaultM : modelsData.models[0].name);
      }
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!selectedModel || !prompt.trim()) {
      toast.error("Please select a model and enter a prompt");
      return;
    }

    setGenerating(true);
    setResult(null);

    try {
      const response = await fetch("/api/ollama/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel,
          prompt: prompt.trim(),
          temperature: temperature[0],
          maxTokens: parseInt(maxTokens) || 2048,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Generation failed");
        return;
      }

      setResult(data);
      toast.success("Generation complete");
    } catch {
      toast.error("Failed to generate response");
    } finally {
      setGenerating(false);
    }
  }, [selectedModel, prompt, temperature, maxTokens]);

  const handleCopyOutput = async () => {
    if (result?.output) {
      await navigator.clipboard.writeText(result.output);
      toast.success("Copied to clipboard");
    }
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  const formatBytes = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return gb >= 1 ? `${gb.toFixed(2)} GB` : `${(bytes / 1024 / 1024).toFixed(0)} MB`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-64" />
          <Skeleton className="mt-2 h-5 w-48" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Generate</h1>
          <p className="mt-1 text-slate-400">
            Create AI responses using your local Ollama models
          </p>
        </div>
        {status === "online" && (
          <Badge variant="outline" className="border-green-600 bg-green-950 text-green-400">
            <span className="mr-1.5 h-2 w-2 rounded-full bg-green-500" />
            Ollama Online
          </Badge>
        )}
      </div>

      {/* Status Banner */}
      {status === "offline" && (
        <Card className="border-red-900 bg-red-950">
          <CardContent className="flex items-center gap-3 py-4">
            <div className="rounded-full bg-red-900 p-2">
              <Zap className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <p className="font-semibold text-red-200">Ollama is offline</p>
              <p className="text-sm text-red-300/70">
                Start Ollama with:{" "}
                <code className="rounded bg-red-900/50 px-1.5 py-0.5">ollama serve</code>
              </p>
            </div>
            <Button
              onClick={loadData}
              variant="outline"
              className="ml-auto border-red-700 text-red-300 hover:bg-red-900"
            >
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      )}

      {status === "online" && models.length === 0 && (
        <Card className="border-yellow-900 bg-yellow-950">
          <CardContent className="flex items-center gap-3 py-4">
            <div className="rounded-full bg-yellow-900 p-2">
              <Sparkles className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="font-semibold text-yellow-200">No models installed</p>
              <p className="text-sm text-yellow-300/70">
                Pull a model using:{" "}
                <code className="rounded bg-yellow-900/50 px-1.5 py-0.5">ollama pull llama3.2</code>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Controls */}
        <div className="space-y-6 lg:col-span-2">
          {/* Model Selection Card */}
          <Card className="border-slate-700 bg-slate-800">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-blue-400" />
                <CardTitle className="text-base font-medium text-white">
                  Model Configuration
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Label className="text-slate-300">Selected Model</Label>
                <button
                  onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
                  className="mt-1.5 flex w-full items-center justify-between rounded-md border border-slate-600 bg-slate-700 px-4 py-3 text-white transition-colors hover:bg-slate-600"
                >
                  <span className="truncate">{selectedModel || "Select a model"}</span>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>

                {modelDropdownOpen && (
                  <div className="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-md border border-slate-600 bg-slate-700 shadow-lg">
                    {models.map((model) => (
                      <button
                        key={model.name}
                        onClick={() => {
                          setSelectedModel(model.name);
                          setModelDropdownOpen(false);
                        }}
                        className={`flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-slate-600 ${
                          selectedModel === model.name ? "bg-blue-600/20 text-blue-400" : "text-white"
                        }`}
                      >
                        <div>
                          <p className="font-medium">{model.name}</p>
                          <p className="text-xs text-slate-400">{formatBytes(model.size)}</p>
                        </div>
                        {defaultModel === model.name && (
                          <Badge variant="outline" className="border-blue-500 text-blue-400">
                            Default
                          </Badge>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Temperature */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <Label className="text-slate-300">Temperature</Label>
                  <span className="text-sm font-medium text-blue-400">{temperature[0].toFixed(1)}</span>
                </div>
                <Slider
                  value={temperature}
                  min={0}
                  max={2}
                  step={0.1}
                  onValueChange={(values) => setTemperature(Array.isArray(values) ? values : [values])}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Precise</span>
                  <span>Creative</span>
                </div>
              </div>

              {/* Max Tokens */}
              <div>
                <Label className="text-slate-300">Max Tokens</Label>
                <input
                  type="number"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-slate-600 bg-slate-700 px-4 py-2.5 text-white outline-none focus:border-blue-500"
                  min={1}
                  max={8192}
                />
              </div>
            </CardContent>
          </Card>

          {/* Prompt Card */}
          <Card className="border-slate-700 bg-slate-800">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <CardTitle className="text-base font-medium text-white">
                  Prompt
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your prompt here... (e.g., 'Explain quantum computing in simple terms')"
                className="min-h-40 border-slate-600 bg-slate-700 text-white placeholder:text-slate-500"
                disabled={generating || status === "offline"}
              />
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  {prompt.length.toLocaleString()} characters
                </span>
                <Button
                  onClick={handleGenerate}
                  disabled={generating || !selectedModel || !prompt.trim() || status === "offline"}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {generating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Generate
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Output */}
        <div className="space-y-6">
          {/* Selected Model Badge */}
          <Card className="border-slate-700 bg-slate-800">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/20">
                  <Sparkles className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Generating with</p>
                  <p className="font-semibold text-white">{selectedModel || "No model selected"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Output Card */}
          <Card className="border-slate-700 bg-slate-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium text-white">Output</CardTitle>
                {result && (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCopyOutput}
                      className="h-8 text-slate-400 hover:bg-slate-700 hover:text-white"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleRegenerate}
                      disabled={generating}
                      className="h-8 text-slate-400 hover:bg-slate-700 hover:text-white"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {generating && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <p className="mt-3 text-sm text-slate-400">Generating response...</p>
                </div>
              )}

              {!generating && !result && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-slate-700 p-4">
                    <Sparkles className="h-8 w-8 text-slate-500" />
                  </div>
                  <p className="mt-4 text-sm text-slate-400">
                    Your generated response will appear here
                  </p>
                </div>
              )}

              {result && (
                <div className="space-y-4">
                  <div className="max-h-96 overflow-y-auto rounded-md bg-slate-700 p-4">
                    <pre className="whitespace-pre-wrap text-sm text-slate-200">
                      {result.output}
                    </pre>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-md bg-slate-700/50 p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-slate-400">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="text-xs">Latency</span>
                      </div>
                      <p className="mt-1 text-lg font-semibold text-white">{result.latency}</p>
                    </div>
                    <div className="rounded-md bg-slate-700/50 p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-slate-400">
                        <Zap className="h-3.5 w-3.5" />
                        <span className="text-xs">Tokens</span>
                      </div>
                      <p className="mt-1 text-lg font-semibold text-white">
                        {result.tokens.total.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded bg-slate-700/30 p-2 text-center">
                      <p className="text-xs text-slate-500">Prompt</p>
                      <p className="text-sm font-medium text-blue-400">
                        {result.tokens.prompt.toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded bg-slate-700/30 p-2 text-center">
                      <p className="text-xs text-slate-500">Completion</p>
                      <p className="text-sm font-medium text-green-400">
                        {result.tokens.completion.toLocaleString()}
                      </p>
                    </div>
                    <div className="rounded bg-slate-700/30 p-2 text-center">
                      <p className="text-xs text-slate-500">Total</p>
                      <p className="text-sm font-medium text-purple-400">
                        {result.tokens.total.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}