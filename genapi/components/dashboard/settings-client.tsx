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
import { toast } from "sonner";
import { 
  Loader2, 
  Settings as SettingsIcon, 
  Shield, 
  Database, 
  Server, 
  Download, 
  Trash2,
  Save,
  RotateCcw
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

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
  const [models, setModels] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    defaultModel: "",
    maxRequestsPerMinute: 60,
    globalTokenCap: null as number | null,
    autoDisableAbuseKeys: true,
    ollamaUrl: "http://localhost:11434",
  });

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
      setModels(data.models?.map((m: { name: string }) => m.name) || []);
    } catch {
      // Ollama may be offline
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

      const data = await response.json();
      setSettings(data);
      toast.success("Settings updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleClearLogs = async () => {
    if (!confirm("Are you sure you want to clear all usage logs? This cannot be undone.")) return;
    try {
      const response = await fetch("/api/usage-logs", { method: "DELETE" });
      if (response.ok) toast.success("Logs cleared successfully");
      else toast.error("Failed to clear logs");
    } catch {
      toast.error("An error occurred while clearing logs");
    }
  };

  const handleExportLogs = () => {
    window.open("/api/usage-logs/export", "_blank");
    toast.info("Preparing export...");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Loading system configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Configure global parameters and system defaults.</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <SettingsIcon className="size-3.5" />
            General
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="size-3.5" />
            Security
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Database className="size-3.5" />
            Logs
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Server className="size-3.5" />
            System
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic platform defaults and preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="defaultModel">Default Inference Model</Label>
                <p className="text-xs text-muted-foreground mb-1">Used when an API request doesn't specify a model.</p>
                <Select
                  value={formData.defaultModel}
                  onValueChange={(val) => setFormData(f => ({ ...f, defaultModel: val }))}
                >
                  <SelectTrigger id="defaultModel">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-refresh models</Label>
                  <p className="text-xs text-muted-foreground">Periodically check for new models in Ollama.</p>
                </div>
                <Switch checked={true} disabled />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security & Limits</CardTitle>
              <CardDescription>Control API access and resource consumption.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="rpm">Global Rate Limit (RPM)</Label>
                <p className="text-xs text-muted-foreground mb-1">Maximum requests per minute per API key.</p>
                <Input
                  id="rpm"
                  type="number"
                  value={formData.maxRequestsPerMinute}
                  onChange={(e) => setFormData(f => ({ ...f, maxRequestsPerMinute: parseInt(e.target.value) }))}
                />
              </div>
              <Separator />
              <div className="grid gap-2">
                <Label htmlFor="tokenCap">Global Token Cap</Label>
                <p className="text-xs text-muted-foreground mb-1">Maximum cumulative tokens allowed across all keys daily.</p>
                <Input
                  id="tokenCap"
                  type="number"
                  placeholder="Unlimited"
                  value={formData.globalTokenCap || ""}
                  onChange={(e) => setFormData(f => ({ ...f, globalTokenCap: e.target.value ? parseInt(e.target.value) : null }))}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-disable abused keys</Label>
                  <p className="text-xs text-muted-foreground">Block keys that consistently exceed rate limits.</p>
                </div>
                <Switch 
                  checked={formData.autoDisableAbuseKeys} 
                  onCheckedChange={(val) => setFormData(f => ({ ...f, autoDisableAbuseKeys: val }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs Settings */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Usage Data & Logs</CardTitle>
              <CardDescription>Manage historical usage data and exports.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between border p-4 rounded-lg">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Export Usage Logs</p>
                    <p className="text-xs text-muted-foreground">Download all usage history in JSON format.</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleExportLogs}>
                    <Download className="mr-2 size-3.5" />
                    Export JSON
                  </Button>
                </div>
                <div className="flex items-center justify-between border p-4 rounded-lg border-destructive/20 bg-destructive/5">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-destructive">Clear All Logs</p>
                    <p className="text-xs text-muted-foreground">Permanently delete all historical usage data.</p>
                  </div>
                  <Button variant="destructive" size="sm" onClick={handleClearLogs}>
                    <Trash2 className="mr-2 size-3.5" />
                    Clear Logs
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>Internal backend and connectivity settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="ollamaUrl">Ollama Endpoint URL</Label>
                <p className="text-xs text-muted-foreground mb-1">The internal URL where your Ollama server is running.</p>
                <div className="flex gap-2">
                  <Input
                    id="ollamaUrl"
                    placeholder="http://localhost:11434"
                    value={formData.ollamaUrl}
                    onChange={(e) => setFormData(f => ({ ...f, ollamaUrl: e.target.value }))}
                  />
                  <Button variant="outline" onClick={() => loadModels()}>Test</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3 mt-8">
        <Button variant="outline" onClick={() => loadSettings()}>
          <RotateCcw className="mr-2 size-4" />
          Reset Changes
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 size-4" />}
          Save Configuration
        </Button>
      </div>
    </div>
  );
}
