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
  Trash2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

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
      toast.error("Failed to load models");
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
      toast.success("Response generated");
    } catch (error: any) {
      toast.error(error.message || "Failed to generate response");
    } finally {
      setGenerating(false);
    }
  }, [selectedModel, prompt, temperature, maxTokens]);

  return (
    <div className="flex flex-col gap-6 lg:h-[calc(100vh-120px)]">
      <div className="flex items-center justify-between px-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chat Playground</h1>
          <p className="text-muted-foreground">Test and refine your local AI models.</p>
        </div>
      </div>

      <div className="grid flex-1 gap-6 lg:grid-cols-[300px_1fr]">
        {/* Left Panel: Settings */}
        <aside className="flex flex-col gap-4">
          <Card className="h-fit">
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Settings2 className="size-4" />
                Model Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="model">Model</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger id="model">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((m) => (
                      <SelectItem key={m.name} value={m.name}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="temp">Temperature</Label>
                  <span className="text-xs font-mono text-muted-foreground">{temperature[0]}</span>
                </div>
                <Slider
                  id="temp"
                  value={temperature}
                  onValueChange={setTemperature}
                  max={2}
                  step={0.1}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="maxTokens">Max Tokens</Label>
                <Input
                  id="maxTokens"
                  type="number"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="pt-0">
               <Button 
                variant="outline" 
                className="w-full text-xs" 
                onClick={() => {
                  setPrompt("");
                  setResult(null);
                }}
              >
                <Trash2 className="mr-2 size-3" />
                Clear Chat
              </Button>
            </CardFooter>
          </Card>
        </aside>

        {/* Main Panel: Chat & Response */}
        <main className="flex flex-col gap-4 overflow-hidden">
          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardHeader className="border-b py-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Brain className="size-4 text-primary" />
                Inference
              </CardTitle>
              {result && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase tracking-wider">
                    <Clock className="size-3" />
                    {result.latency}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase tracking-wider">
                    <Zap className="size-3" />
                    {result.tokens.total} tokens
                  </div>
                </div>
              )}
            </CardHeader>
            
            <ScrollArea className="flex-1 p-4 bg-muted/5">
              {!result && !generating && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-50 py-20">
                  <Sparkles className="size-8 mb-4" />
                  <p className="text-sm">Enter a prompt to start testing.</p>
                </div>
              )}
              
              {generating && (
                <div className="flex gap-3 max-w-[80%]">
                  <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Brain className="size-4 text-primary animate-pulse" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted animate-pulse rounded w-full" />
                    <div className="h-4 bg-muted animate-pulse rounded w-5/6" />
                    <div className="h-4 bg-muted animate-pulse rounded w-4/6" />
                  </div>
                </div>
              )}

              {result && (
                <div className="flex gap-4">
                  <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Brain className="size-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <p className="whitespace-pre-wrap leading-relaxed text-sm">
                        {result.output}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 text-[11px]"
                        onClick={() => {
                          navigator.clipboard.writeText(result.output);
                          toast.success("Copied to clipboard");
                        }}
                      >
                        <Copy className="mr-2 size-3" />
                        Copy Response
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 text-[11px]"
                        onClick={handleGenerate}
                        disabled={generating}
                      >
                        <RefreshCw className="mr-2 size-3" />
                        Regenerate
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </ScrollArea>

            <CardFooter className="border-t p-4 bg-background">
              <div className="relative w-full">
                <Textarea
                  placeholder="Type your prompt here..."
                  className="min-h-[100px] w-full resize-none pr-12 focus-visible:ring-1"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleGenerate();
                    }
                  }}
                />
                <Button 
                  size="icon" 
                  className="absolute bottom-3 right-3 size-8"
                  disabled={generating || !prompt.trim()}
                  onClick={handleGenerate}
                >
                  {generating ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </main>
      </div>
    </div>
  );
}