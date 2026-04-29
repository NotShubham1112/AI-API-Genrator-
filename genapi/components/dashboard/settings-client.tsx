"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { 
  Loader2, 
  Globe, 
  ShieldCheck, 
  Save, 
  Brain,
  Cpu,
  RefreshCw,
  Trash2,
  Download
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OllamaModel {
  name: string;
  size: number;
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
  const [activeTab, setActiveTab] = useState<"general" | "security">("general");

  useEffect(() => {
    loadSettings();
    loadModels();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      const data = await response.json();
      setSettings(data);
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
    } catch {
      console.error("Failed to load models");
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!response.ok) throw new Error("Failed to save settings");
      toast.success("Settings saved successfully");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            Configure your local AI engine and global API consumption policies.
          </p>
        </div>
        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border">
          <Button 
            variant={activeTab === "general" ? "secondary" : "ghost"} 
            size="sm" 
            className={cn("text-xs h-8 px-4 font-medium", activeTab === "general" && "bg-white shadow-sm border")}
            onClick={() => setActiveTab("general")}
          >
            General
          </Button>
          <Button 
            variant={activeTab === "security" ? "secondary" : "ghost"} 
            size="sm" 
            className={cn("text-xs h-8 px-4 font-medium", activeTab === "security" && "bg-white shadow-sm border")}
            onClick={() => setActiveTab("security")}
          >
            Security
          </Button>
        </div>
      </div>

      <div className="space-y-10">
        {activeTab === "general" && (
          <>
            {/* Connection Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-blue-50 text-blue-600"><Globe className="size-4" /></div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Local Engine</h2>
              </div>
              <Card className="shadow-sm">
                <CardContent className="p-6 space-y-6">
                  <div className="grid gap-2">
                    <Label htmlFor="ollamaUrl" className="text-sm font-medium">Ollama Server URL</Label>
                    <div className="flex gap-3">
                      <Input 
                        id="ollamaUrl" 
                        value={settings.ollamaUrl} 
                        onChange={(e) => setSettings({ ...settings, ollamaUrl: e.target.value })}
                        className="h-10 flex-1 bg-slate-50/50"
                      />
                      <Button variant="outline" size="sm" className="h-10 px-4" onClick={loadModels}>
                        <RefreshCw className="size-3.5 mr-2" /> Test
                      </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Default: http://localhost:11434</p>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Defaults Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-slate-50 text-slate-600"><Brain className="size-4" /></div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">API Defaults</h2>
              </div>
              <Card className="shadow-sm">
                <CardContent className="p-6 space-y-6">
                  <div className="grid gap-2">
                    <Label className="text-sm font-medium">Global Default Model</Label>
                    <Select 
                      value={settings.defaultModel} 
                      onValueChange={(val) => setSettings({ ...settings, defaultModel: val || "" })}
                    >
                      <SelectTrigger className="h-10 bg-slate-50/50">
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                      <SelectContent>
                        {models.map((m) => (
                          <SelectItem key={m.name} value={m.name} className="text-sm font-medium">{m.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">This model will be used if no model is specified in the API request.</p>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* System Info */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-slate-50 text-slate-600"><Cpu className="size-4" /></div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Models Inventory</h2>
              </div>
              <Card className="shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50/50 border-b">
                      <tr>
                        <th className="px-6 py-3 font-semibold text-muted-foreground text-[10px] uppercase tracking-wider">Model Name</th>
                        <th className="px-6 py-3 font-semibold text-muted-foreground text-[10px] uppercase tracking-wider">Size</th>
                        <th className="px-6 py-3 font-semibold text-muted-foreground text-[10px] uppercase tracking-wider text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {models.map((m) => (
                        <tr key={m.name} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-medium">{m.name}</td>
                          <td className="px-6 py-4 text-muted-foreground font-mono text-xs">{(m.size / (1024*1024*1024)).toFixed(2)} GB</td>
                          <td className="px-6 py-4 text-right">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-[10px] font-semibold text-emerald-600 border border-emerald-100">
                              Ready
                            </span>
                          </td>
                        </tr>
                      ))}
                      {models.length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-6 py-10 text-center text-muted-foreground">
                            No models found. Check your Ollama connection.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </section>
          </>
        )}

        {activeTab === "security" && (
          <>
            {/* Security & Limits Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-slate-50 text-slate-600"><ShieldCheck className="size-4" /></div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Governance & Limits</h2>
              </div>
              <Card className="shadow-sm">
                <CardContent className="p-6 space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-semibold">Automatic Abuse Prevention</Label>
                      <p className="text-xs text-muted-foreground">Automatically disable API keys that exceed safety thresholds.</p>
                    </div>
                    <Switch 
                      checked={settings.autoDisableAbuseKeys} 
                      onCheckedChange={(val) => setSettings({ ...settings, autoDisableAbuseKeys: val })} 
                    />
                  </div>

                  <Separator />

                  <div className="grid sm:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <Label htmlFor="rpm" className="text-sm font-medium">Global Rate Limit (RPM)</Label>
                      <Input 
                        id="rpm" 
                        type="number" 
                        value={settings.maxRequestsPerMinute} 
                        onChange={(e) => setSettings({ ...settings, maxRequestsPerMinute: parseInt(e.target.value) })}
                        className="h-10 bg-slate-50/50"
                      />
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Requests per minute across all keys.</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cap" className="text-sm font-medium">Global Token Cap</Label>
                      <Input 
                        id="cap" 
                        type="number" 
                        value={settings.globalTokenCap || ""} 
                        placeholder="Unlimited"
                        onChange={(e) => setSettings({ ...settings, globalTokenCap: e.target.value ? parseInt(e.target.value) : null })}
                        className="h-10 bg-slate-50/50"
                      />
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Total lifetime tokens allowed.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Data Management */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-slate-50 text-slate-600"><Trash2 className="size-4" /></div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Data Management</h2>
              </div>
              <Card className="shadow-sm">
                <CardContent className="p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-foreground">Usage Telemetry</p>
                      <p className="text-xs text-muted-foreground">Export or clear your system interaction logs.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="h-9 px-4 text-xs font-medium">
                        <Download className="size-3.5 mr-2" /> Export CSV
                      </Button>
                      <Button variant="outline" size="sm" className="h-9 px-4 text-xs font-medium text-destructive hover:bg-destructive/5 hover:text-destructive border-destructive/20">
                        <Trash2 className="size-3.5 mr-2" /> Clear Logs
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </>
        )}

        {/* Footer Actions */}
        <div className="pt-6 flex items-center justify-end gap-3 border-t">
          <Button variant="ghost" className="text-xs font-medium" onClick={() => window.location.reload()}>Discard changes</Button>
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="h-10 px-8 shadow-md shadow-blue-500/10 bg-blue-600 hover:bg-blue-700 text-white transition-all active:scale-95"
          >
            {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
            Save configuration
          </Button>
        </div>
      </div>
    </div>
  );
}
