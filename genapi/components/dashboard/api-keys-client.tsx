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
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Activity,
  MoreVertical,
  Loader2,
  Zap,
  Lock,
  Globe,
  Fingerprint,
  Terminal,
  ShieldCheck,
  Key
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

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
      toast.error("Failed to load credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newKeyName) {
      toast.error("Label required");
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
      if (!response.ok) throw new Error(data.error);

      setCreatedKey({ key: data.key, message: data.message });
      setNewKeyName("");
      setNewKeyTokenLimit("");
      setNewKeyRequestLimit("");
      setSelectedModels([]);
      setDefaultModel("");
      setAllModelsAccess(true);
      setOpen(false);
      toast.success("Security key provisioned");
      await loadKeys();
    } catch (e: any) {
      toast.error(e.message || "Provisioning failed");
    } finally {
      setCreating(false);
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("Key copied to clipboard");
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/api-keys/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: isActive ? "disable" : "enable" }),
      });
      toast.success(isActive ? "Key revoked" : "Key authorized");
      await loadKeys();
    } catch {
      toast.error("Auth update failed");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/api-keys/${id}`, { method: "DELETE" });
      toast.success("Identity purged");
      setDeleteConfirm(null);
      await loadKeys();
    } catch {
      toast.error("Purge failed");
    }
  };

  const toggleModel = (model: string) => {
    setSelectedModels((prev) =>
      prev.includes(model) ? prev.filter((m) => m !== model) : [...prev, model]
    );
  };

  const calculateUsage = (used: number, limit: number | null) => {
    if (!limit) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse">
        <Loader2 className="h-6 w-6 animate-spin text-primary opacity-20" />
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-3">Syncing Vault...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">API Keys</h1>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            Manage your API credentials and monitor usage across your applications.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={
            <Button className="h-10 px-5 rounded-lg shadow-sm">
              <Plus className="mr-2 size-4" /> Create new key
            </Button>
          } />
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create API Key</DialogTitle>
              <DialogDescription>
                Give your key a name and set usage limits to control consumption.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-5 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Key name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Production Web App"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="h-10"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tokenLimit">Token limit (optional)</Label>
                  <Input
                    id="tokenLimit"
                    type="number"
                    placeholder="Unlimited"
                    value={newKeyTokenLimit}
                    onChange={(e) => setNewKeyTokenLimit(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requestLimit">Request limit (optional)</Label>
                  <Input
                    id="requestLimit"
                    type="number"
                    placeholder="Unlimited"
                    value={newKeyRequestLimit}
                    onChange={(e) => setNewKeyRequestLimit(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Model access</Label>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="all-models"
                      checked={allModelsAccess}
                      onCheckedChange={(c) => setAllModelsAccess(!!c)}
                    />
                    <Label htmlFor="all-models" className="text-sm font-normal cursor-pointer">All models</Label>
                  </div>
                </div>
                {!allModelsAccess && (
                  <ScrollArea className="h-40 rounded-md border p-3">
                    <div className="space-y-2">
                      {initialModels.map((m) => (
                        <div key={m.name} className="flex items-center gap-2">
                          <Checkbox
                            id={m.name}
                            checked={selectedModels.includes(m.name)}
                            onCheckedChange={() => toggleModel(m.name)}
                          />
                          <Label htmlFor={m.name} className="text-sm font-normal cursor-pointer">{m.name}</Label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={creating}>
                {creating ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                Create key
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {createdKey && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <h3 className="text-sm font-semibold text-blue-900">Key created successfully</h3>
                <p className="text-xs text-blue-700/80">
                  Please copy this key now. For security reasons, you won't be able to see it again.
                </p>
                <div className="flex items-center gap-2 mt-3 bg-white border border-blue-100 rounded-lg p-2 font-mono text-xs shadow-sm">
                  <span className="flex-1 break-all text-blue-600 px-2">{createdKey.key}</span>
                  <Button size="icon" variant="ghost" className="size-8 text-blue-600 hover:bg-blue-50" onClick={() => handleCopyKey(createdKey.key)}>
                    <Copy className="size-3.5" />
                  </Button>
                </div>
              </div>
              <Button onClick={() => setCreatedKey(null)} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shrink-0">
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground font-medium">Active Keys</span>
              <ShieldCheck className="size-4 text-muted-foreground" />
            </div>
            <div className="mt-3">
              <span className="text-3xl font-bold">{keys.filter(k => k.isActive).length}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground font-medium">Total Usage</span>
              <Zap className="size-4 text-muted-foreground" />
            </div>
            <div className="mt-3">
              <span className="text-3xl font-bold">{keys.reduce((acc, k) => acc + k.tokensUsed, 0).toLocaleString()}</span>
              <span className="text-xs text-muted-foreground ml-2 font-medium">tokens</span>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-none bg-slate-50/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Requests</span>
              <Activity className="size-4 text-blue-500" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold">{(keys || []).reduce((acc, k) => acc + (k.requestsCount || 0), 0).toLocaleString()}</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Calls</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Section */}
      <div className="w-full mt-8">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-transparent">
              <TableRow className="hover:bg-transparent border-b">
                <TableHead className="w-[280px] text-[10px] uppercase tracking-widest font-bold text-muted-foreground py-4 px-0">Identity & Scope</TableHead>
                <TableHead className="w-[220px] text-[10px] uppercase tracking-widest font-bold text-muted-foreground py-4 px-0">Credentials</TableHead>
                <TableHead className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground py-4 px-0">Quota Usage</TableHead>
                <TableHead className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground py-4 px-0">Provisioned</TableHead>
                <TableHead className="w-[80px] text-right py-4 px-0"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.length > 0 ? (
                keys.map((key) => (
                  <TableRow key={key.id} className="group hover:bg-slate-50/50 transition-colors">
                    <TableCell className="py-5 px-0">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-foreground tracking-tight">{key.name}</span>
                          {!key.isActive && (
                            <Badge variant="destructive" className="text-[9px] h-4 px-1.5 font-bold uppercase tracking-tighter">Disabled</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                            {key.allowedModels === "all" || !key.allowedModels ? "Full Engine Access" : "Restricted Access"}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-5 px-0">
                      <div className="flex items-center gap-2 group/key w-fit">
                        <code className="text-[11px] font-mono font-medium text-muted-foreground bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                          {showKey === key.id ? key.key : `${key.key.substring(0, 8)}••••••••`}
                        </code>
                        <div className="flex items-center gap-1 opacity-0 group-hover/key:opacity-100 transition-all duration-200">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            className="rounded-md hover:bg-slate-100"
                            onClick={() => setShowKey(showKey === key.id ? null : key.id)}
                          >
                            {showKey === key.id ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            className="rounded-md hover:bg-slate-100"
                            onClick={() => handleCopyKey(key.key)}
                          >
                            <Copy className="size-3" />
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-0">
                      <div className="space-y-2 max-w-[140px]">
                        <div className="flex items-center justify-between text-[10px] font-medium text-muted-foreground">
                          <span>{key.tokensUsed.toLocaleString()} tokens</span>
                          {key.tokenLimit && <span className="opacity-60">/ {key.tokenLimit.toLocaleString()}</span>}
                        </div>
                        <Progress value={calculateUsage(key.tokensUsed, key.tokenLimit)} className="h-1 bg-slate-100" />
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-0">
                      <span className="text-xs text-muted-foreground">
                        {new Date(key.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 px-0 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger render={
                          <Button variant="ghost" size="icon" className="size-8 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="size-4" />
                          </Button>
                        } />
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => handleToggleActive(key.id, key.isActive)}>
                            {key.isActive ? <Lock className="mr-2 size-3.5" /> : <ShieldCheck className="mr-2 size-3.5" />}
                            {key.isActive ? "Disable" : "Enable"}
                          </DropdownMenuItem>
                          <Separator className="my-1" />
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteConfirm(key.id)}>
                            <Trash2 className="mr-2 size-3.5" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="size-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                        <Key className="size-6 text-muted-foreground/40" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold">No API keys found</p>
                        <p className="text-xs text-muted-foreground">Create your first key to start using the API.</p>
                      </div>
                      <Button variant="outline" size="sm" className="mt-2" onClick={() => setOpen(true)}>
                        Create first key
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog open={deleteConfirm !== null} onOpenChange={(o) => !o && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This API key will be permanently deleted. Any applications using this key will immediately lose access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
              Delete key
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
