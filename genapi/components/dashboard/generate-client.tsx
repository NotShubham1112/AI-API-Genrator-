"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Loader2,
  Sparkles,
  Copy,
  RefreshCw,
  Zap,
  Clock,
  Send,
  Brain,
  Settings2,
  Trash2,
  Maximize2,
  Cpu
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface Model {
  name: string;
  size: number;
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
  const [loading, setLoading] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [temperature, setTemperature] = useState([0.7]);
  const [maxTokens, setMaxTokens] = useState<string>("2048");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      const response = await fetch("/api/ollama/models");
      const data = await response.json();
      setModels(data.models || []);
      if (data.models?.length > 0) {
        setSelectedModel(data.models[0].name);
      }
    } catch {
      toast.error("Engine offline");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!selectedModel || !prompt.trim()) return;
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
      if (!response.ok) throw new Error(data.error || "Generation failed");
      setResult(data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setGenerating(false);
    }
  }, [selectedModel, prompt, temperature, maxTokens]);

  if (loading) return null;

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Playground</h1>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            Test and refine your prompts with real-time inference from local models.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
          <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">Engine Ready</span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 min-h-0">
        {/* Left: Configuration */}
        <div className="space-y-6 overflow-auto pr-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Model</Label>
              <Select value={selectedModel} onValueChange={(val) => setSelectedModel(val || "")}>
                <SelectTrigger className="h-10 bg-white shadow-sm">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {models.map((m) => (
                    <SelectItem key={m.name} value={m.name} className="text-sm">
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Temperature</Label>
                <span className="text-xs font-mono font-bold text-blue-600">{temperature[0]}</span>
              </div>
              <Slider value={temperature} onValueChange={(val) => setTemperature(Array.isArray(val) ? val : [val])} max={2} step={0.1} className="py-2" />
            </div>

            <div className="space-y-2 pt-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Max Tokens</Label>
              <Input
                type="number"
                value={maxTokens}
                onChange={(e) => setMaxTokens(e.target.value)}
                className="h-10 bg-white shadow-sm font-mono text-sm"
              />
            </div>
          </div>

          <Separator />

          <Button
            variant="ghost"
            size="sm"
            className="w-full h-9 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/5"
            onClick={() => { setPrompt(""); setResult(null); }}
          >
            <Trash2 className="size-3.5 mr-2" /> Clear session
          </Button>
        </div>

        {/* Right: Workspace */}
        <div className="flex flex-col gap-4 min-h-0">
          <Card className="flex-1 flex flex-col shadow-sm border overflow-hidden bg-slate-50/30">
            <div className="px-6 py-3 border-b bg-white/50 backdrop-blur-sm flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <Brain className="size-4 text-blue-600" /> Response
              </div>
              {result && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                    <Clock className="size-3" /> {result.latency}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                    <Zap className="size-3" /> {result.tokens.total} tokens
                  </div>
                </div>
              )}
            </div>

            <ScrollArea className="flex-1 p-8">
              {!result && !generating && (
                <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-30">
                  <Sparkles className="size-12 text-blue-600 mb-4" />
                  <p className="text-sm font-medium">Ready for your prompt</p>
                </div>
              )}

              {generating && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-blue-600">
                    <Loader2 className="size-4 animate-spin" />
                    <span className="text-xs font-semibold uppercase tracking-wider animate-pulse">Generating...</span>
                  </div>
                  <div className="space-y-2 opacity-10">
                    <div className="h-3 bg-slate-400 rounded w-full" />
                    <div className="h-3 bg-slate-400 rounded w-[95%]" />
                    <div className="h-3 bg-slate-400 rounded w-[90%]" />
                  </div>
                </div>
              )}

              {result && (
                <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
                  <div className="prose prose-slate max-w-none">
                    <p className="text-sm leading-7 text-foreground/90 whitespace-pre-wrap font-medium">
                      {result.output}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 pt-6 border-t border-slate-200">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs bg-white shadow-sm"
                      onClick={() => { navigator.clipboard.writeText(result.output); toast.success("Copied to clipboard"); }}
                    >
                      <Copy className="mr-2 size-3.5 text-muted-foreground" /> Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs bg-white shadow-sm"
                      onClick={handleGenerate}
                    >
                      <RefreshCw className="mr-2 size-3.5 text-muted-foreground" /> Regenerate
                    </Button>
                  </div>
                </div>
              )}
            </ScrollArea>

            <div className="p-4 border-t bg-white">
              <div className="relative max-w-4xl mx-auto">
                <Textarea
                  placeholder="Enter your prompt here..."
                  className="min-h-[100px] w-full resize-none border-none focus-visible:ring-0 text-sm leading-relaxed p-4 bg-slate-50/50 rounded-xl"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleGenerate();
                    }
                  }}
                />
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground font-medium bg-white px-2 py-1 rounded border shadow-sm mr-2 hidden sm:block">
                    Press Enter to send
                  </span>
                  <Button
                    size="icon"
                    className="size-9 rounded-lg shadow-lg shadow-blue-500/10 active:scale-95 transition-all bg-blue-600 hover:bg-blue-700"
                    disabled={generating || !prompt.trim()}
                    onClick={handleGenerate}
                  >
                    {generating ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
