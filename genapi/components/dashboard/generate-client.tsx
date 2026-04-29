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
    <div className="h-[calc(100vh-120px)] flex flex-col gap-4 overflow-hidden max-w-[1200px] mx-auto p-2">
      {/* Compact Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black tracking-tighter">PLAYGROUND</h1>
            <Badge variant="outline" className="h-5 text-[10px] font-mono border-primary/20 text-primary bg-primary/5 uppercase px-2 py-0.5">v2.4-BETA</Badge>
          </div>
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mt-0.5 opacity-50">Inference Sandbox</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/20 border border-border/40">
           <div className="size-2 rounded-full bg-green-500" />
           <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Stable Connection</span>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4 min-h-0">
        
        {/* Left: Tuning Panel */}
        <Card className="flex flex-col border-border/60 bg-card/30 overflow-hidden rounded-xl">
           <CardHeader className="p-4 border-b border-border/40 bg-muted/10">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                 <Settings2 className="size-4 text-primary" /> Parameters
              </CardTitle>
           </CardHeader>
           <CardContent className="flex-1 p-5 space-y-6 overflow-auto">
              <div className="space-y-2">
                 <Label className="text-xs font-black uppercase text-muted-foreground/80 ml-1">Active Engine</Label>
                 <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="h-10 bg-background border-border/60 text-xs font-bold rounded-lg">
                       <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                       {models.map((m) => <SelectItem key={m.name} value={m.name} className="text-xs">{m.name}</SelectItem>)}
                    </SelectContent>
                 </Select>
              </div>

              <div className="space-y-4">
                 <div className="flex items-center justify-between ml-1">
                    <Label className="text-xs font-black uppercase text-muted-foreground/80">Temperature</Label>
                    <span className="text-xs font-mono text-primary font-bold">{temperature[0]}</span>
                 </div>
                 <Slider value={temperature} onValueChange={setTemperature} max={2} step={0.1} className="py-2" />
              </div>

              <div className="space-y-2">
                 <Label className="text-xs font-black uppercase text-muted-foreground/80 ml-1">Max Tokens</Label>
                 <div className="flex items-center gap-2">
                    <Input type="number" value={maxTokens} onChange={(e) => setMaxTokens(e.target.value)} className="h-10 bg-background border-border/60 text-xs font-mono rounded-lg" />
                 </div>
              </div>
           </CardContent>
           <CardFooter className="p-4 border-t border-border/40 bg-muted/5">
              <Button variant="ghost" size="sm" className="w-full h-9 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-destructive" onClick={() => { setPrompt(""); setResult(null); }}>
                 <Trash2 className="size-4 mr-2" /> Reset Context
              </Button>
           </CardFooter>
        </Card>

        {/* Right: Interaction Canvas */}
        <div className="flex flex-col gap-3 min-h-0">
           <Card className="flex-1 flex flex-col border-border/60 bg-card/40 backdrop-blur-sm overflow-hidden rounded-xl">
              <CardHeader className="p-4 border-b border-border/40 bg-muted/10 flex flex-row items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
                       <Brain className="size-4 text-primary" /> System Output
                    </div>
                    {result && (
                       <div className="flex items-center gap-4 border-l border-border/40 pl-4">
                          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                             <Clock className="size-3" /> {result.latency}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                             <Zap className="size-3" /> {result.tokens.total}T
                          </div>
                       </div>
                    )}
                 </div>
                 <Button variant="ghost" size="icon" className="size-8"><Maximize2 className="size-4 opacity-40" /></Button>
              </CardHeader>
              
              <ScrollArea className="flex-1 p-6 selection:bg-primary/10">
                 {!result && !generating && (
                    <div className="h-full flex flex-col items-center justify-center text-center py-16 opacity-40">
                       <Sparkles className="size-10 text-primary mb-4" />
                       <p className="text-xs font-black uppercase tracking-[0.2em]">Signal Pending</p>
                    </div>
                 )}
                 
                 {generating && (
                    <div className="space-y-4">
                       <div className="flex items-center gap-3">
                          <Loader2 className="size-4 animate-spin text-primary" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">Processing Inference...</span>
                       </div>
                       <div className="space-y-1.5 opacity-10">
                          <div className="h-2 bg-muted rounded w-full" />
                          <div className="h-2 bg-muted rounded w-5/6" />
                          <div className="h-2 bg-muted rounded w-4/6" />
                       </div>
                    </div>
                 )}

                 {result && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-1 duration-300">
                       <div className="prose prose-sm dark:prose-invert max-w-none">
                          <p className="whitespace-pre-wrap leading-relaxed text-sm font-medium text-foreground/90">
                             {result.output}
                          </p>
                       </div>
                       <div className="flex items-center gap-3 pt-4 border-t border-border/40 mt-4">
                          <Button variant="outline" size="sm" className="h-9 text-[10px] font-black uppercase tracking-widest border-border/60 px-4" onClick={() => { navigator.clipboard.writeText(result.output); toast.success("Copied"); }}>
                             <Copy className="mr-2 size-3.5" /> Copy Output
                          </Button>
                          <Button variant="outline" size="sm" className="h-9 text-[10px] font-black uppercase tracking-widest border-border/60 px-4" onClick={handleGenerate}>
                             <RefreshCw className="mr-2 size-3.5" /> Retry Request
                          </Button>
                       </div>
                    </div>
                 )}
              </ScrollArea>

              <div className="p-4 border-t border-border/40 bg-card">
                 <div className="relative group">
                    <Textarea
                       placeholder="Enter prompt..."
                       className="min-h-[80px] w-full resize-none bg-muted/10 border-border/40 focus-visible:ring-primary/10 text-xs leading-relaxed p-3 rounded-lg transition-all"
                       value={prompt}
                       onChange={(e) => setPrompt(e.target.value)}
                       onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }}
                    />
                    <div className="absolute bottom-2.5 right-2.5">
                       <Button size="icon" className="size-8 rounded-lg shadow-lg shadow-primary/5 active:scale-95 transition-all" disabled={generating || !prompt.trim()} onClick={handleGenerate}>
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