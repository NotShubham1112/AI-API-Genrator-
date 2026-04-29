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
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Settings {
  id: string;
  defaultModel: string;
  maxRequestsPerMinute: number;
  globalTokenCap: number | null;
  autoDisableAbuseKeys: boolean;
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
      // Ollama may be offline, that's ok
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

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      const data = await response.json();
      setSettings(data);
      toast.success("Settings saved successfully");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (settings) {
      setFormData({
        defaultModel: settings.defaultModel,
        maxRequestsPerMinute: settings.maxRequestsPerMinute,
        globalTokenCap: settings.globalTokenCap,
        autoDisableAbuseKeys: settings.autoDisableAbuseKeys,
      });
      toast.success("Settings reset to saved values");
    }
  };

  const handleResetDefaults = () => {
    setFormData({
      defaultModel: "llama2",
      maxRequestsPerMinute: 60,
      globalTokenCap: null,
      autoDisableAbuseKeys: true,
    });
    toast.success("Reset to default values");
  };

  if (loading) {
    return (
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-500" />
        <p className="mt-2 text-slate-400">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-slate-400">
          Configure your Local AI API Platform
        </p>
      </div>

      {/* Settings Form */}
      <Card className="border-slate-700 bg-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Platform Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Default Model */}
          <div>
            <Label className="text-slate-300">Default Model</Label>
            <p className="mb-2 text-sm text-slate-500">
              Model used when no specific model is provided
            </p>
            {models.length > 0 ? (
              <Select
                value={formData.defaultModel}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    defaultModel: value || "llama2",
                  }))
                }
              >
                <SelectTrigger className="border-slate-600 bg-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-slate-600 bg-slate-700">
                  {models.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={formData.defaultModel}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    defaultModel: e.target.value,
                  }))
                }
                className="border-slate-600 bg-slate-700 text-white"
                placeholder="llama2"
              />
            )}
          </div>

          {/* Max Requests Per Minute */}
          <div>
            <Label className="text-slate-300">Max Requests Per Minute</Label>
            <p className="mb-2 text-sm text-slate-500">
              Rate limit for API requests
            </p>
            <Input
              type="number"
              value={formData.maxRequestsPerMinute}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  maxRequestsPerMinute: parseInt(e.target.value) || 60,
                }))
              }
              className="border-slate-600 bg-slate-700 text-white"
            />
          </div>

          {/* Global Token Cap */}
          <div>
            <Label className="text-slate-300">Global Token Cap (Optional)</Label>
            <p className="mb-2 text-sm text-slate-500">
              Maximum tokens allowed globally per day. Leave empty for unlimited.
            </p>
            <Input
              type="number"
              value={formData.globalTokenCap || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  globalTokenCap: e.target.value ? parseInt(e.target.value) : null,
                }))
              }
              className="border-slate-600 bg-slate-700 text-white"
              placeholder="Leave empty for unlimited"
            />
          </div>

          {/* Auto Disable Abuse Keys */}
          <div className="flex items-center justify-between rounded-lg border border-slate-600 bg-slate-700 p-4">
            <div>
              <Label className="text-slate-300">Auto Disable Abused Keys</Label>
              <p className="text-sm text-slate-500">
                Automatically disable keys that exceed rate limits
              </p>
            </div>
            <Switch
              checked={formData.autoDisableAbuseKeys}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  autoDisableAbuseKeys: checked,
                }))
              }
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Settings"
              )}
            </Button>
            <Button
              onClick={handleReset}
              className="bg-slate-700 hover:bg-slate-600"
            >
              Reset to Saved
            </Button>
            <Button
              onClick={handleResetDefaults}
              className="bg-slate-700 hover:bg-slate-600"
            >
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card className="border-slate-700 bg-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-400">
          <div>
            <p className="font-semibold text-white">API Endpoint</p>
            <p className="font-mono text-xs">POST /api/v1/chat</p>
          </div>
          <div>
            <p className="font-semibold text-white">Authentication</p>
            <p>Use Bearer token with your API key in the Authorization header</p>
          </div>
          <div>
            <p className="font-semibold text-white">Rate Limiting</p>
            <p>
              Requests are rate limited per API key. Excessive usage will
              trigger automatic key disablement.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
