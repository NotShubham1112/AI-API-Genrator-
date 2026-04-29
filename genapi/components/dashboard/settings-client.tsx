"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Loader2, 
  Cpu, 
  Globe, 
  Shield, 
  Database, 
  Save, 
  LogOut, 
  Zap, 
  Download, 
  Trash2,
  Settings as SettingsIcon,
  ChevronRight,
  HardDrive,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OllamaModel {
  name: string;
  size: number;
  modifiedAt: string;
}

interface Settings {
  id: string;
  defaultModel: string;
  maxRequestsPerMinute: number;
  globalTokenCap: number | null;
  autoDisableAbuseKeys: boolean;
  ollamaUrl: string;
}

export function SettingsClient() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [systemInfo, setSystemInfo] = useState({
    status: "offline",
    version: "",
    latency: 0
  });
  const [formData, setFormData] = useState({
    defaultModel: "",
    maxRequestsPerMinute: 60,
    globalTokenCap: null as number | null,
    autoDisableAbuseKeys: true,
    ollamaUrl: "http://localhost:11434",
  });
  
  // Tab state
  const [activeTab, setActiveTab] = useState<"inference" | "security" | "network">("inference");

  useEffect(() => {
    loadSettings();
    loadModels();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      const data = await response.json();
      setSettings(data);
      setFormData({
        defaultModel: data.defaultModel,
        maxRequestsPerMinute: data.maxRequestsPerMinute,
        globalTokenCap: data.globalTokenCap,
        autoDisableAbuseKeys: data.autoDisableAbuseKeys,
        ollamaUrl: data.ollamaUrl || "http://localhost:11434",
      });
    } catch {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const loadModels = async () => {
    try {
      const response = await fetch("/api/ollama/models");
      const data = await response.json();
      setModels(data.models || []);
      setSystemInfo({
        status: data.status,
        version: data.version,
        latency: data.responseTime
      });
    } catch {
      setSystemInfo(s => ({ ...s, status: "offline" }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Failed to save settings");
      toast.success("Configuration synced");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const formatSize = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return gb >= 1 ? `${gb.toFixed(1)}GB` : `${(bytes / (1024 * 1024)).toFixed(0)}MB`;
  };

  if (loading) return null;

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col gap-6 p-4 overflow-hidden max-w-[1000px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 pb-6 border-b border-border/40">
        <div className="flex items-center gap-4">
           <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-md">
              <SettingsIcon className="size-5" />
           </div>
           <div className="flex flex-col justify-center">
              <h1 className="text-xl font-black tracking-tight uppercase leading-none mb-1.5">Workspace Settings</h1>
              <div className="flex items-center gap-2">
                 <Badge variant="outline" className={cn("px-1.5 py-0 text-[9px] font-mono border-border uppercase h-4", systemInfo.status === "online" ? "text-green-500 bg-green-500/10" : "text-red-500 bg-red-500/10")}>
                    {systemInfo.status === "online" ? "ENGINE ONLINE" : "ENGINE OFFLINE"}
                 </Badge>
                 <Badge variant="outline" className="px-1.5 py-0 text-[9px] font-mono border-border text-blue-500 bg-blue-500/10 h-4">
                    {systemInfo.latency}MS LATENCY
                 </Badge>
              </div>
           </div>
        </div>
        
        <div className="flex items-center gap-2">
           <Button variant="ghost" onClick={() => window.location.href='/login'} className="h-9 px-4 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all font-bold text-[10px] uppercase tracking-widest">
              Sign Out
           </Button>
           <Button onClick={handleSave} disabled={saving} className="h-9 px-6 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all active:scale-95 shadow-sm font-bold text-[10px] uppercase tracking-widest">
              {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5 mr-2" />}
              Sync Config
           </Button>
        </div>
      </div>

      {/* Horizontal Segmented Control */}
      <div className="flex items-center p-1 bg-muted/30 border border-border/60 rounded-xl w-fit shadow-inner">
         <Button 
            variant="ghost" 
            onClick={() => setActiveTab("inference")}
            className={cn("h-8 px-5 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all", activeTab === "inference" ? "bg-background shadow-sm border border-border/40 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50")}
         >
            <Cpu className={cn("size-3.5 mr-2", activeTab === "inference" ? "text-primary" : "")} /> Inference
         </Button>
         <Button 
            variant="ghost" 
            onClick={() => setActiveTab("security")}
            className={cn("h-8 px-5 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all", activeTab === "security" ? "bg-background shadow-sm border border-border/40 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50")}
         >
            <Shield className={cn("size-3.5 mr-2", activeTab === "security" ? "text-primary" : "")} /> Security
         </Button>
         <Button 
            variant="ghost" 
            onClick={() => setActiveTab("network")}
            className={cn("h-8 px-5 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all", activeTab === "network" ? "bg-background shadow-sm border border-border/40 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50")}
         >
            <Globe className={cn("size-3.5 mr-2", activeTab === "network" ? "text-primary" : "")} /> Network
         </Button>
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 overflow-auto pb-10">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
            
            {/* --- INFERENCE TAB --- */}
            {activeTab === "inference" && (
               <>
                  <Card className="md:col-span-1 flex flex-col border-border/60 bg-card/20 shadow-sm rounded-xl h-fit">
                     <CardHeader className="p-4 border-b border-border/40 bg-muted/10">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                           <Cpu className="size-4 text-primary" /> Primary Engine
                        </CardTitle>
                     </CardHeader>
                     <CardContent className="p-5 space-y-5">
                        <div className="space-y-2">
                           <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-0.5">Default Model</Label>
                           <Select value={formData.defaultModel} onValueChange={(v) => setFormData(f => ({ ...f, defaultModel: v }))}>
                              <SelectTrigger className="h-9 bg-background border-border/60 text-xs font-bold rounded-lg shadow-sm">
                                 <SelectValue placeholder="Select a model..." />
                              </SelectTrigger>
                              <SelectContent className="rounded-lg">
                                 {models.map(m => <SelectItem key={m.name} value={m.name} className="text-xs font-medium py-2">{m.name}</SelectItem>)}
                              </SelectContent>
                           </Select>
                        </div>
                        <div className="space-y-2">
                           <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-0.5">API Revision</Label>
                           <Input disabled value={systemInfo.version || "STABLE"} className="h-9 bg-muted/20 border-border/40 font-mono text-xs font-bold rounded-lg cursor-not-allowed text-muted-foreground" />
                        </div>
                     </CardContent>
                  </Card>

                  <Card className="md:col-span-1 flex flex-col border-border/60 bg-card/20 shadow-sm rounded-xl h-[450px]">
                     <CardHeader className="p-4 border-b border-border/40 bg-muted/10 flex flex-row items-center justify-between shrink-0">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                           <HardDrive className="size-4 text-primary" /> Local Registry
                        </CardTitle>
                        <Button variant="ghost" size="sm" onClick={loadModels} className="h-8 px-3 rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-colors border border-border/40 bg-background">
                           <RefreshCw className="size-3 mr-2" /> Sync
                        </Button>
                     </CardHeader>
                     <CardContent className="flex-1 p-0 overflow-auto scrollbar-hide">
                        <div className="divide-y divide-border/20">
                           {models.map(m => (
                              <div key={m.name} className="flex items-center justify-between p-4 hover:bg-primary/[0.02] transition-colors group">
                                 <div className="flex items-center gap-4">
                                    <div className="size-10 rounded-xl bg-background border border-border/40 flex items-center justify-center text-muted-foreground shadow-sm group-hover:text-primary group-hover:border-primary/30 transition-all">
                                       <Zap className="size-4" />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                       <span className="text-xs font-black tracking-tight">{m.name}</span>
                                       <span className="text-[10px] text-muted-foreground font-mono opacity-50 uppercase tracking-tighter">ID: {m.name.split(':')[1] || 'LATEST'}</span>
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-4">
                                    <span className="text-[10px] font-mono font-bold text-muted-foreground bg-muted/30 px-2 py-1 rounded-md border border-border/20">{formatSize(m.size)}</span>
                                 </div>
                              </div>
                           ))}
                           {models.length === 0 && <div className="p-12 text-center text-xs text-muted-foreground font-bold uppercase tracking-widest opacity-40">No models detected on host.</div>}
                        </div>
                     </CardContent>
                     <CardFooter className="p-4 border-t border-border/40 bg-muted/5 shrink-0 flex justify-between items-center">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Total VRAM Cost: {formatSize(models.reduce((acc, m) => acc + m.size, 0))}</span>
                        <span className="text-[9px] font-black text-primary uppercase tracking-widest px-2 py-1 bg-primary/10 rounded-md">{models.length} Nodes</span>
                     </CardFooter>
                  </Card>
               </>
            )}

            {/* --- SECURITY TAB --- */}
            {activeTab === "security" && (
               <>
                  <Card className="md:col-span-1 flex flex-col border-border/60 bg-card/20 shadow-sm rounded-xl h-fit">
                     <CardHeader className="p-4 border-b border-border/40 bg-muted/10">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                           <Shield className="size-4 text-primary" /> Security Policies
                        </CardTitle>
                     </CardHeader>
                     <CardContent className="p-5 space-y-5">
                        <div className="space-y-2">
                           <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-0.5">Global Rate Limit (RPM)</Label>
                           <Input type="number" value={formData.maxRequestsPerMinute} onChange={(e) => setFormData(f => ({ ...f, maxRequestsPerMinute: parseInt(e.target.value) || 0 }))} className="h-9 bg-background border-border/60 text-xs font-mono font-bold rounded-lg shadow-sm" />
                           <p className="text-[10px] text-muted-foreground opacity-60 ml-0.5 mt-1">Maximum requests allowed per minute per identity.</p>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-muted/20 shadow-inner">
                           <div className="flex flex-col">
                              <span className="text-xs font-black uppercase tracking-tight">Auto-Block Abuse</span>
                              <span className="text-[9px] text-muted-foreground opacity-70 leading-tight pr-2 mt-0.5">Automatically revoke identities that exceed limits.</span>
                           </div>
                           <Switch checked={formData.autoDisableAbuseKeys} onCheckedChange={(v) => setFormData(f => ({ ...f, autoDisableAbuseKeys: v }))} className="shrink-0 scale-90" />
                        </div>
                     </CardContent>
                  </Card>

                  <Card className="md:col-span-1 flex flex-col border-border/60 bg-card/20 shadow-sm rounded-xl h-fit">
                     <CardHeader className="p-4 border-b border-border/40 bg-muted/10">
                        <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                           <Database className="size-4 text-primary" /> Data Governance
                        </CardTitle>
                     </CardHeader>
                     <CardContent className="p-5 space-y-5">
                        <div className="flex flex-col gap-1.5">
                           <span className="text-sm font-black uppercase tracking-tight">Historical Telemetry</span>
                           <p className="text-[10px] text-muted-foreground font-medium opacity-70 leading-relaxed">
                              Export your complete API usage history as a CSV file, or permanently flush the database to reclaim disk space. Flushed data cannot be recovered.
                           </p>
                        </div>
                        <div className="flex flex-col gap-3 pt-1">
                           <Button variant="outline" onClick={() => window.open('/api/usage-logs/export')} className="h-9 w-full text-[10px] font-bold uppercase tracking-widest border-border/60 bg-background shadow-sm hover:bg-muted/50 rounded-lg">
                              <Download className="size-3.5 mr-2" /> Export CSV Log
                           </Button>
                           <Button variant="outline" onClick={async () => { if(confirm("Flush all telemetry? This action is permanent.")) await fetch("/api/usage-logs", { method: "DELETE" }); }} className="h-9 w-full text-[10px] font-bold uppercase tracking-widest text-destructive hover:bg-destructive/10 border-destructive/20 rounded-lg transition-colors">
                              <Trash2 className="size-3.5 mr-2" /> Flush Database
                           </Button>
                        </div>
                     </CardContent>
                  </Card>
               </>
            )}

            {/* --- NETWORK TAB --- */}
            {activeTab === "network" && (
               <Card className="md:col-span-2 flex flex-col border-border/60 bg-card/20 shadow-sm rounded-xl h-fit">
                  <CardHeader className="p-4 border-b border-border/40 bg-muted/10">
                     <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Globe className="size-4 text-primary" /> Connectivity
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 space-y-5 max-w-xl">
                     <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-0.5">Ollama Daemon URL</Label>
                        <div className="flex gap-2">
                           <Input value={formData.ollamaUrl} onChange={(e) => setFormData(f => ({ ...f, ollamaUrl: e.target.value }))} className="h-9 bg-background border-border/60 text-xs font-mono font-bold rounded-lg shadow-sm flex-1" />
                        </div>
                        <p className="text-[10px] text-muted-foreground opacity-60 ml-0.5 mt-1.5 leading-relaxed">
                           The local endpoint where the AI engine is running. Default is usually <code className="bg-muted/50 px-1 py-0.5 rounded text-foreground">http://localhost:11434</code>. 
                        </p>
                     </div>
                     
                     <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 mt-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-blue-500 mb-2">Firewall Note</h4>
                        <p className="text-[10px] font-medium leading-relaxed opacity-80 text-foreground">
                           The gateway strictly routes traffic from authorized programmatic clients. Verify that port 3000 is open on your host machine if you intend to consume the API from an external network application.
                        </p>
                     </div>
                  </CardContent>
               </Card>
            )}

         </div>
      </div>
    </div>
  );
}
