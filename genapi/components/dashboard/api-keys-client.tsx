"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
  Check,
  Shield,
  Layers,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ApiKeyItem {
  id: string;
  name: string;
  key: string;
  isActive: boolean;
  tokenLimit: number | null;
  requestLimit: number | null;
  allowedModels: string | null;
  defaultModel: string | null;
  requestsCount: number;
  tokensUsed: number;
  lastUsedAt: string | null;
  createdAt: string;
}

interface OllamaModel {
  name: string;
}

interface ApiKeysClientProps {
  initialModels?: OllamaModel[];
}

export function ApiKeysClient({ initialModels = [] }: ApiKeysClientProps) {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyTokenLimit, setNewKeyTokenLimit] = useState("");
  const [newKeyRequestLimit, setNewKeyRequestLimit] = useState("");
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [defaultModel, setDefaultModel] = useState<string>("");
  const [allModelsAccess, setAllModelsAccess] = useState(true);
  
  const [createdKey, setCreatedKey] = useState<{
    key: string;
    message: string;
  } | null>(null);
  const [showKey, setShowKey] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renamingValue, setRenamingValue] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

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
          tokenLimit: newKeyTokenLimit ? parseInt(newKeyTokenLimit) : null,
          requestLimit: newKeyRequestLimit ? parseInt(newKeyRequestLimit) : null,
          allowedModels: allModelsAccess ? ["all"] : selectedModels,
          defaultModel: defaultModel || null,
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
      setNewKeyRequestLimit("");
      setSelectedModels([]);
      setDefaultModel("");
      setAllModelsAccess(true);
      setOpen(false);
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

      toast.success(isActive ? "API key disabled" : "API key enabled");
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

  const toggleModel = (model: string) => {
    setSelectedModels((prev) =>
      prev.includes(model) ? prev.filter((m) => m !== model) : [...prev, model]
    );
  };

  return (
    <div className="space-y-6">
      {/* Creation Modal Feedback */}
      {createdKey && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-primary">
                <CheckCircle className="size-5" />
                <span className="font-semibold">{createdKey.message}</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border bg-background p-3 font-mono text-sm">
                <span className="flex-1 break-all text-foreground">{createdKey.key}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleCopyKey(createdKey.key)}
                >
                  <Copy className="size-4" />
                </Button>
              </div>
              <Button onClick={() => setCreatedKey(null)} className="w-full">
                I have saved this key
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="size-5 text-primary" />
          <h2 className="text-xl font-semibold tracking-tight">Access Keys</h2>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button size="sm" />}>
            <Plus className="mr-2 size-4" />
            Create Key
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create API Key</DialogTitle>
              <DialogDescription>
                Configure permissions and limits for a new access key.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Key Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Production App"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="tokenLimit">Token Limit</Label>
                  <Input
                    id="tokenLimit"
                    type="number"
                    placeholder="Unlimited"
                    value={newKeyTokenLimit}
                    onChange={(e) => setNewKeyTokenLimit(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="requestLimit">Request Limit</Label>
                  <Input
                    id="requestLimit"
                    type="number"
                    placeholder="Unlimited"
                    value={newKeyRequestLimit}
                    onChange={(e) => setNewKeyRequestLimit(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>Allowed Models</Label>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="all-models"
                      checked={allModelsAccess}
                      onCheckedChange={(checked) => setAllModelsAccess(!!checked)}
                    />
                    <Label htmlFor="all-models" className="text-xs font-normal">
                      All Models Access
                    </Label>
                  </div>
                </div>
                
                {!allModelsAccess && (
                  <ScrollArea className="h-32 rounded-md border p-2">
                    <div className="grid gap-2">
                      {initialModels.map((model) => (
                        <div key={model.name} className="flex items-center gap-2">
                          <Checkbox
                            id={model.name}
                            checked={selectedModels.includes(model.name)}
                            onCheckedChange={() => toggleModel(model.name)}
                          />
                          <Label htmlFor={model.name} className="text-xs font-normal">
                            {model.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="defaultModel">Default Model</Label>
                <Select value={defaultModel} onValueChange={setDefaultModel}>
                  <SelectTrigger id="defaultModel">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {(allModelsAccess ? initialModels : initialModels.filter(m => selectedModels.includes(m.name))).map((model) => (
                      <SelectItem key={model.name} value={model.name}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={creating}>
                {creating ? "Generating..." : "Generate Key"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[150px]">Name</TableHead>
                <TableHead>Partial Key</TableHead>
                <TableHead>Allowed Models</TableHead>
                <TableHead>Default</TableHead>
                <TableHead className="text-right">Requests</TableHead>
                <TableHead className="text-right">Tokens</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={8} className="h-12 animate-pulse bg-muted/20" />
                  </TableRow>
                ))
              ) : keys.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                    No API keys found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                keys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">
                      {renaming === key.id ? (
                        <Input
                          value={renamingValue}
                          onChange={(e) => setRenamingValue(e.target.value)}
                          onBlur={() => handleRename(key.id)}
                          onKeyDown={(e) => e.key === "Enter" && handleRename(key.id)}
                          autoFocus
                          className="h-8"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          {key.name}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-4 opacity-0 group-hover:opacity-100"
                            onClick={() => {
                              setRenaming(key.id);
                              setRenamingValue(key.name);
                            }}
                          >
                            <Edit2 className="size-3" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                          {showKey === key.id ? key.key : `${key.key}...`}
                        </code>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-6"
                          onClick={() => setShowKey(showKey === key.id ? null : key.id)}
                        >
                          {showKey === key.id ? (
                            <EyeOff className="size-3" />
                          ) : (
                            <Eye className="size-3" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-6"
                          onClick={() => handleCopyKey(key.key)}
                        >
                          <Copy className="size-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {key.allowedModels === "all" || !key.allowedModels ? (
                          <Badge variant="secondary" className="text-[10px]">All</Badge>
                        ) : (
                          key.allowedModels.split(",").slice(0, 2).map(m => (
                            <Badge key={m} variant="outline" className="text-[10px]">{m}</Badge>
                          ))
                        )}
                        {key.allowedModels && key.allowedModels.split(",").length > 2 && (
                          <Badge variant="outline" className="text-[10px]">+{key.allowedModels.split(",").length - 2}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {key.defaultModel || "-"}
                    </TableCell>
                    <TableCell className="text-right text-xs">
                      {key.requestsCount}
                      {key.requestLimit && <span className="text-muted-foreground">/{key.requestLimit}</span>}
                    </TableCell>
                    <TableCell className="text-right text-xs">
                      {key.tokensUsed.toLocaleString()}
                      {key.tokenLimit && <span className="text-muted-foreground">/{key.tokenLimit.toLocaleString()}</span>}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={key.isActive ? "default" : "destructive"}
                        className="h-5 text-[10px] px-1.5"
                      >
                        {key.isActive ? "Active" : "Disabled"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8"
                          onClick={() => handleToggleActive(key.id, key.isActive)}
                        >
                          {key.isActive ? (
                            <XCircle className="size-4 text-orange-500" />
                          ) : (
                            <CheckCircle className="size-4 text-green-500" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8"
                          onClick={() => handleResetStats(key.id)}
                        >
                          <RotateCcw className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteConfirm(key.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog
        open={deleteConfirm !== null}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete API Key</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the API key and all its associated usage data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              Delete Permanently
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
