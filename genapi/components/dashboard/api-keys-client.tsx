"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Plus,
  RotateCcw,
  Edit2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Label } from "@/components/ui/label";

interface ApiKeyItem {
  id: string;
  name: string;
  key: string;
  isActive: boolean;
  tokenLimit: number | null;
  requestsCount: number;
  tokensUsed: number;
  lastUsedAt: string | null;
  createdAt: string;
}

export function ApiKeysClient() {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyTokenLimit, setNewKeyTokenLimit] = useState("");
  const [createdKey, setCreatedKey] = useState<{
    key: string;
    message: string;
  } | null>(null);
  const [showKey, setShowKey] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renamingValue, setRenamingValue] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    try {
      const response = await fetch("/api/api-keys");
      const data = await response.json();
      setKeys(data);
    } catch {
      toast.error("Failed to load API keys");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newKeyName) {
      toast.error("Please enter a key name");
      return;
    }

    setCreating(true);
    try {
      const response = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newKeyName,
          tokenLimit: newKeyTokenLimit ? parseInt(newKeyTokenLimit) : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to create API key");
        return;
      }

      setCreatedKey({ key: data.key, message: data.message });
      setNewKeyName("");
      setNewKeyTokenLimit("");
      toast.success("API key created successfully!");
      await loadKeys();
    } catch {
      toast.error("Failed to create API key");
    } finally {
      setCreating(false);
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("API key copied to clipboard");
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/api-keys/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: isActive ? "disable" : "enable" }),
      });

      toast.success(
        isActive ? "API key disabled" : "API key enabled"
      );
      await loadKeys();
    } catch {
      toast.error("Failed to update API key");
    }
  };

  const handleResetStats = async (id: string) => {
    try {
      await fetch(`/api/api-keys/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset-stats" }),
      });

      toast.success("Stats reset successfully");
      await loadKeys();
    } catch {
      toast.error("Failed to reset stats");
    }
  };

  const handleRename = async (id: string) => {
    if (!renamingValue) {
      toast.error("Please enter a new name");
      return;
    }

    try {
      await fetch(`/api/api-keys/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rename", name: renamingValue }),
      });

      toast.success("API key renamed successfully");
      setRenaming(null);
      setRenamingValue("");
      await loadKeys();
    } catch {
      toast.error("Failed to rename API key");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/api-keys/${id}`, {
        method: "DELETE",
      });

      toast.success("API key deleted successfully");
      setDeleteConfirm(null);
      await loadKeys();
    } catch {
      toast.error("Failed to delete API key");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">API Keys</h1>
        <p className="mt-1 text-slate-400">
          Create and manage API keys for your local AI models
        </p>
      </div>

      {/* Create Key Dialog */}
      {createdKey && (
        <Card className="border-green-900 bg-green-950">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <p className="font-semibold text-green-400">
                ✓ {createdKey.message}
              </p>
              <div className="flex items-center gap-2 rounded bg-green-900 p-3 font-mono text-sm text-green-300">
                <span className="flex-1 break-all">{createdKey.key}</span>
                <Button
                  size="sm"
                  onClick={() => handleCopyKey(createdKey.key)}
                  className="bg-green-700 hover:bg-green-800"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Button
                onClick={() => setCreatedKey(null)}
                className="w-full bg-green-700 hover:bg-green-800"
              >
                Got it
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog>
        <DialogTrigger>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Create New Key
          </Button>
        </DialogTrigger>
        <DialogContent className="border-slate-700 bg-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">Create API Key</DialogTitle>
            <DialogDescription className="text-slate-400">
              Generate a new API key for local AI models
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-slate-300">Key Name</Label>
              <Input
                placeholder="My API Key"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="border-slate-600 bg-slate-700 text-white"
              />
            </div>

            <div>
              <Label className="text-slate-300">Token Limit (Optional)</Label>
              <Input
                type="number"
                placeholder="e.g., 10000"
                value={newKeyTokenLimit}
                onChange={(e) => setNewKeyTokenLimit(e.target.value)}
                className="border-slate-600 bg-slate-700 text-white"
              />
            </div>

            <Button
              onClick={handleCreate}
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={creating}
            >
              {creating ? "Creating..." : "Create API Key"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Keys Table */}
      <Card className="border-slate-700 bg-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Your API Keys</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center">
              <p className="text-slate-400">Loading...</p>
            </div>
          ) : keys.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-slate-400">No API keys yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-transparent">
                    <TableHead className="text-slate-400">Name</TableHead>
                    <TableHead className="text-slate-400">Key</TableHead>
                    <TableHead className="text-center text-slate-400">
                      Status
                    </TableHead>
                    <TableHead className="text-right text-slate-400">
                      Requests
                    </TableHead>
                    <TableHead className="text-right text-slate-400">
                      Tokens
                    </TableHead>
                    <TableHead className="text-slate-400">Last Used</TableHead>
                    <TableHead className="text-right text-slate-400">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {keys.map((key) => (
                    <TableRow key={key.id} className="border-slate-700">
                      <TableCell className="font-medium text-white">
                        {renaming === key.id ? (
                          <div className="flex gap-2">
                            <Input
                              value={renamingValue}
                              onChange={(e) =>
                                setRenamingValue(e.target.value)
                              }
                              className="border-slate-600 bg-slate-700 text-white"
                              placeholder="New name"
                            />
                            <Button
                              size="sm"
                              onClick={() => handleRename(key.id)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Save
                            </Button>
                          </div>
                        ) : (
                          key.name
                        )}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        <div className="flex items-center gap-2">
                          {showKey === key.id ? (
                            <span className="font-mono text-xs">
                              {key.key}
                            </span>
                          ) : (
                            <span className="font-mono text-xs">
                              {key.key.substring(0, 8)}...
                            </span>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              setShowKey(
                                showKey === key.id ? null : key.id
                              )
                            }
                            className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                          >
                            {showKey === key.id ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {key.isActive ? (
                          <CheckCircle className="mx-auto h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="mx-auto h-4 w-4 text-red-500" />
                        )}
                      </TableCell>
                      <TableCell className="text-right text-slate-300">
                        {key.requestsCount}
                      </TableCell>
                      <TableCell className="text-right text-slate-300">
                        {key.tokensUsed}
                      </TableCell>
                      <TableCell className="text-slate-400 text-sm">
                        {key.lastUsedAt
                          ? new Date(key.lastUsedAt).toLocaleDateString(
                              "en-US"
                            )
                          : "Never"}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setRenaming(key.id);
                              setRenamingValue(key.name);
                            }}
                            className="text-slate-400 hover:text-white"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              handleToggleActive(key.id, key.isActive)
                            }
                            className="text-slate-400 hover:text-white"
                          >
                            {key.isActive ? "Disable" : "Enable"}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleResetStats(key.id)}
                            className="text-slate-400 hover:text-white"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeleteConfirm(key.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteConfirm !== null}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <AlertDialogContent className="border-slate-700 bg-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Delete API Key
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to delete this API key? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel className="border-slate-600 text-white hover:bg-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deleteConfirm && handleDelete(deleteConfirm)
              }
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
