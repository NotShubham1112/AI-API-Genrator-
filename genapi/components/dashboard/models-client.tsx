"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle, Loader2, Star } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Model {
  name: string;
  size: number;
  modifiedAt: string;
}

export function ModelsClient() {
  const [models, setModels] = useState<Model[]>([]);
  const [status, setStatus] = useState<"online" | "offline">("offline");
  const [loading, setLoading] = useState(true);
  const [defaultModel, setDefaultModel] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [testPrompt, setTestPrompt] = useState("");
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{
    output: string;
    latency: string;
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  } | null>(null);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      const response = await fetch("/api/ollama/models");
      const data = await response.json();

      setStatus(data.status);
      setModels(data.models || []);

      // Load default model from settings
      const settingsRes = await fetch("/api/settings");
      const settings = await settingsRes.json();
      setDefaultModel(settings.defaultModel);

      if (data.models && data.models.length > 0) {
        setSelectedModel(data.models[0].name);
      }
    } catch {
      toast.error("Failed to load models");
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (model: string) => {
    try {
      const response = await fetch("/api/ollama/set-default", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model }),
      });

      if (!response.ok) {
        throw new Error("Failed to set default model");
      }

      setDefaultModel(model);
      toast.success("Default model updated");
    } catch {
      toast.error("Failed to set default model");
    }
  };

  const handleTestModel = async () => {
    if (!selectedModel || !testPrompt) {
      toast.error("Please select a model and enter a prompt");
      return;
    }

    setTestLoading(true);
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
        toast.error(data.error || "Failed to test model");
        return;
      }

      setTestResult(data);
      toast.success("Model test completed");
    } catch {
      toast.error("Failed to test model");
    } finally {
      setTestLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return gb.toFixed(2) + " GB";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Models</h1>
        <p className="mt-1 text-slate-400">
          Manage and test your Ollama local models
        </p>
      </div>

      {/* Status Banner */}
      {status === "offline" && (
        <Alert className="border-red-900 bg-red-950">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-200">
            Ollama is offline. Make sure it&apos;s running on
            {" "}
            http://localhost:11434
            <Button
              onClick={loadModels}
              className="ml-2 bg-red-700 hover:bg-red-800"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {status === "online" && models.length === 0 && (
        <Alert className="border-yellow-900 bg-yellow-950">
          <AlertTriangle className="h-4 w-4 text-yellow-400" />
          <AlertDescription className="text-yellow-200">
            Ollama is online but no models are installed. Pull a model using
            Ollama CLI first.
          </AlertDescription>
        </Alert>
      )}

      {status === "online" && (
        <Alert className="border-green-900 bg-green-950">
          <CheckCircle className="h-4 w-4 text-green-400" />
          <AlertDescription className="text-green-200">
            Ollama is online and ready. {models.length} model(s) available.
          </AlertDescription>
        </Alert>
      )}

      {/* Models Grid */}
      {models.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {models.map((model) => (
            <Card
              key={model.name}
              className={`border-2 transition-all ${
                defaultModel === model.name
                  ? "border-blue-600 bg-slate-700"
                  : "border-slate-700 bg-slate-800 hover:border-slate-600"
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="flex items-center gap-2 text-white">
                    {model.name}
                    {defaultModel === model.name && (
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    )}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500">Size</p>
                  <p className="text-sm font-semibold text-slate-300">
                    {formatBytes(model.size)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Modified</p>
                  <p className="text-sm text-slate-300">
                    {new Date(model.modifiedAt).toLocaleDateString("en-US")}
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  {defaultModel === model.name ? (
                    <Button
                      disabled
                      className="w-full bg-blue-600"
                    >
                      ✓ Default
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleSetDefault(model.name)}
                      className="w-full bg-slate-700 hover:bg-slate-600"
                    >
                      Set as Default
                    </Button>
                  )}
                  <Button
                    onClick={() => setSelectedModel(model.name)}
                    variant="outline"
                    className="w-full border-slate-600 text-white hover:bg-slate-700"
                  >
                    Test Model
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Test Model Section */}
      {models.length > 0 && (
        <Card className="border-slate-700 bg-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Test Model</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-slate-300">
                Selected Model: <span className="font-bold text-blue-400">{selectedModel}</span>
              </Label>
            </div>

            <div>
              <Label className="text-slate-300">Prompt</Label>
              <Textarea
                placeholder="Enter a prompt to test the model..."
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                className="border-slate-600 bg-slate-700 text-white"
                rows={4}
              />
            </div>

            <Button
              onClick={handleTestModel}
              disabled={testLoading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {testLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Test Model"
              )}
            </Button>

            {testResult && (
              <div className="space-y-3 rounded-lg border border-slate-600 bg-slate-700 p-4">
                <div>
                  <p className="text-xs text-slate-400">Latency</p>
                  <p className="text-sm font-semibold text-slate-200">
                    {testResult.latency}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded bg-slate-600 p-2 text-center">
                    <p className="text-xs text-slate-400">Prompt Tokens</p>
                    <p className="text-sm font-bold text-blue-400">
                      {testResult.usage.prompt_tokens}
                    </p>
                  </div>
                  <div className="rounded bg-slate-600 p-2 text-center">
                    <p className="text-xs text-slate-400">Completion</p>
                    <p className="text-sm font-bold text-green-400">
                      {testResult.usage.completion_tokens}
                    </p>
                  </div>
                  <div className="rounded bg-slate-600 p-2 text-center">
                    <p className="text-xs text-slate-400">Total</p>
                    <p className="text-sm font-bold text-yellow-400">
                      {testResult.usage.total_tokens}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Output</p>
                  <div className="max-h-64 overflow-y-auto rounded bg-slate-600 p-3 text-sm text-slate-200">
                    {testResult.output}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-500" />
          <p className="mt-2 text-slate-400">Loading models...</p>
        </div>
      )}
    </div>
  );
}
