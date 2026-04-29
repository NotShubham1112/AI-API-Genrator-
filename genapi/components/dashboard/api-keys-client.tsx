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
    <div className="max-w-[1200px] mx-auto space-y-6 py-6 px-4 md:px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/40">
        <div className="flex items-center gap-3">
           <div className="p-2 rounded-lg bg-primary text-primary-foreground">
              <ShieldCheck className="size-6" />
           </div>
           <div>
              <h1 className="text-2xl font-black tracking-tight leading-tight select-none">AUTH GATEWAY</h1>
              <div className="flex items-center gap-2">
                 <Badge variant="outline" className="text-[10px] font-mono border-primary/20 text-primary bg-primary/5 uppercase px-2 py-0">v2.4</Badge>
                 <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest opacity-60">Credential Vault</span>
              </div>
           </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
           <div className="flex items-center gap-6 px-5 py-2.5 rounded-xl bg-card border border-border/60 shadow-sm">
              <div className="flex flex-col">
                 <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-50">Sessions</span>
                 <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black tabular-nums tracking-tighter">{keys.filter(k => k.isActive).length}</span>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase">Active</span>
                 </div>
              </div>
              <Separator orientation="vertical" className="h-8 opacity-20" />
              <div className="flex flex-col">
                 <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-50">Consumption</span>
                 <div className="flex items-baseline gap-1 text-primary">
                    <span className="text-xl font-black tabular-nums tracking-tighter">{keys.reduce((acc, k) => acc + k.tokensUsed, 0).toLocaleString()}</span>
                    <span className="text-[10px] font-bold uppercase">Tokens</span>
                 </div>
              </div>
           </div>

           <Dialog open={open} onOpenChange={setOpen}>
             <DialogTrigger render={<Button className="h-12 px-6 rounded-xl font-bold uppercase tracking-widest shadow-md hover:scale-[1.02] active:scale-95 transition-all group" />}>
               <Plus className="mr-2 size-4 group-hover:rotate-90 transition-transform" /> Provision Identity
             </DialogTrigger>
             <DialogContent className="max-w-md border-border bg-card shadow-2xl rounded-2xl overflow-hidden">
               <DialogHeader className="space-y-2">
                 <DialogTitle className="text-xl font-black tracking-tight uppercase italic py-0.5">New Identity</DialogTitle>
                 <DialogDescription className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Define request source boundaries.</DialogDescription>
               </DialogHeader>
               <div className="grid gap-4 py-4">
                 <div className="space-y-2">
                   <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Identity Label</Label>
                   <Input id="name" placeholder="DEV_ENV" value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} className="h-10 bg-background border-border/60 rounded-lg text-sm" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label htmlFor="tokenLimit" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Token Cap</Label>
                     <Input id="tokenLimit" type="number" placeholder="INF" value={newKeyTokenLimit} onChange={(e) => setNewKeyTokenLimit(e.target.value)} className="h-10 bg-background border-border/60 rounded-lg font-mono text-sm" />
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="requestLimit" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Req. Cap</Label>
                     <Input id="requestLimit" type="number" placeholder="INF" value={newKeyRequestLimit} onChange={(e) => setNewKeyRequestLimit(e.target.value)} className="h-10 bg-background border-border/60 rounded-lg font-mono text-sm" />
                   </div>
                 </div>
                 <div className="space-y-3">
                   <div className="flex items-center justify-between ml-1">
                     <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Model Scope</Label>
                     <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/40">
                       <Checkbox id="all-models" checked={allModelsAccess} onCheckedChange={(c) => setAllModelsAccess(!!c)} className="size-4 rounded" />
                       <Label htmlFor="all-models" className="text-[10px] font-bold uppercase text-primary cursor-pointer tracking-widest">Universal</Label>
                     </div>
                   </div>
                   {!allModelsAccess && (
                     <ScrollArea className="h-40 rounded-xl border border-border/60 bg-muted/10 p-3">
                       <div className="grid gap-2">
                         {initialModels.map((m) => (
                           <div key={m.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-background border border-transparent hover:border-border/40 transition-colors group/item">
                             <Checkbox id={m.name} checked={selectedModels.includes(m.name)} onCheckedChange={() => toggleModel(m.name)} className="size-4" />
                             <Label htmlFor={m.name} className="text-xs font-bold uppercase tracking-tight cursor-pointer group-hover/item:text-primary">{m.name}</Label>
                           </div>
                         ))}
                       </div>
                     </ScrollArea>
                   )}
                 </div>
               </div>
               <DialogFooter className="gap-2">
                 <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-xl uppercase font-bold text-xs tracking-widest h-10 px-6">Cancel</Button>
                 <Button onClick={handleCreate} disabled={creating} className="rounded-xl h-10 px-8 font-bold uppercase text-xs tracking-widest shadow-md">
                   {creating ? <Loader2 className="size-4 animate-spin" /> : "Verify & Provision"}
                 </Button>
               </DialogFooter>
             </DialogContent>
           </Dialog>
        </div>
      </div>

      {createdKey && (
        <Card className="border-primary/50 border bg-primary/5 rounded-2xl overflow-hidden relative">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-1 space-y-4">
                 <div className="flex items-center gap-4">
                   <div className="size-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg">
                      <Terminal className="size-6" />
                   </div>
                   <div>
                      <h3 className="text-xl font-black tracking-tight uppercase italic py-0.5">IDENTITY SECURED</h3>
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest opacity-60">Record hash immediately.</p>
                   </div>
                 </div>
                 
                 <div className="flex items-center gap-4 rounded-xl border border-primary/20 bg-background p-4 font-mono text-sm shadow-sm">
                    <span className="flex-1 break-all text-primary font-bold">{createdKey.key}</span>
                    <Button size="icon" variant="ghost" className="size-10 rounded-lg shrink-0" onClick={() => handleCopyKey(createdKey.key)}>
                       <Copy className="size-4" />
                    </Button>
                 </div>
              </div>
              
              <div className="shrink-0 flex flex-col items-center justify-center pt-2 md:pt-0">
                 <Button onClick={() => setCreatedKey(null)} size="lg" className="h-12 px-8 rounded-xl font-bold uppercase text-xs tracking-widest">
                   I have recorded the key
                 </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Horizontal List Layout */}
      <div className="flex flex-col gap-4 pb-10">
        {keys.length > 0 ? (
          keys.map((key) => (
            <Card key={key.id} className="group border-border/60 bg-card/40 hover:border-primary/40 transition-all rounded-2xl overflow-hidden shadow-sm">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center">
                {/* Identity & Key Section */}
                <div className="p-5 flex-1 min-w-[320px] space-y-4 border-b lg:border-b-0 lg:border-r border-border/40">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("size-2.5 rounded-full", key.isActive ? "bg-primary animate-pulse" : "bg-destructive/30")} />
                      <h3 className="text-lg font-black tracking-tight uppercase italic truncate max-w-[180px]">{key.name}</h3>
                      <div className="flex gap-1.5">
                        <Badge variant={key.isActive ? "secondary" : "outline"} className="h-5 text-[9px] px-1.5 font-bold uppercase rounded-md border-border/60">
                          {key.isActive ? "ACTIVE" : "REVOKED"}
                        </Badge>
                        {key.allowedModels === "all" || !key.allowedModels ? (
                          <Badge className="h-5 text-[9px] px-1.5 font-bold uppercase rounded-md bg-primary/10 text-primary border-none">UNIVERSAL</Badge>
                        ) : (
                          <Badge variant="outline" className="h-5 text-[9px] px-1.5 font-bold uppercase rounded-md border-border/60">FILTERED</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-mono font-bold text-muted-foreground bg-muted/20 px-3 py-2 rounded-lg border border-border/40">
                    <Fingerprint className="size-3.5 text-primary opacity-30" />
                    <span className="flex-1 tracking-tight truncate font-mono">{showKey === key.id ? key.key : `${key.key.substring(0, 10)}••••••••`}</span>
                    <div className="flex items-center gap-2 border-l border-border/60 pl-2 ml-1">
                      <button onClick={() => setShowKey(showKey === key.id ? null : key.id)} className="hover:text-primary transition-colors">
                        {showKey === key.id ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                      </button>
                      <button onClick={() => handleCopyKey(key.key)} className="hover:text-primary transition-colors">
                        <Copy className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Stats Section */}
                <div className="p-5 flex-[1.8] grid grid-cols-1 sm:grid-cols-2 gap-8 border-b lg:border-b-0 lg:border-r border-border/40">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                      <div className="flex items-center gap-1.5"><Zap className="size-3 text-primary" /> Tokens</div>
                      <span className="font-mono text-foreground">{key.tokensUsed.toLocaleString()} <span className="opacity-30">/</span> {key.tokenLimit ? key.tokenLimit.toLocaleString() : "∞"}</span>
                    </div>
                    <Progress value={calculateUsage(key.tokensUsed, key.tokenLimit)} className="h-1.5 rounded-full bg-muted/40" />
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                      <div className="flex items-center gap-1.5"><Activity className="size-3 text-primary" /> Requests</div>
                      <span className="font-mono text-foreground">{key.requestsCount} <span className="opacity-30">/</span> {key.requestLimit || "∞"}</span>
                    </div>
                    <Progress value={calculateUsage(key.requestsCount, key.requestLimit)} className="h-1.5 rounded-full bg-muted/40" />
                  </div>
                </div>

                {/* Metadata & Actions Section */}
                <div className="p-5 flex-1 flex items-center justify-between gap-6 min-w-[240px]">
                  <div className="flex gap-8">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1.5"><Globe className="size-2.5" /> Scope</span>
                      <span className="text-[11px] font-bold text-primary truncate max-w-[80px]">{key.allowedModels === "all" || !key.allowedModels ? "UNIVERSAL" : key.allowedModels.split(',')[0]}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">Issued</span>
                      <span className="text-[11px] font-bold text-foreground">{new Date(key.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="size-10 rounded-xl hover:bg-muted" />}>
                      <MoreVertical className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 p-2 rounded-xl shadow-xl border-border/40">
                      <DropdownMenuItem className="rounded-lg h-10 px-3 font-bold uppercase text-xs tracking-widest" onClick={() => handleToggleActive(key.id, key.isActive)}>
                         {key.isActive ? <Lock className="mr-2 size-4" /> : <ShieldCheck className="mr-2 size-4" />}
                         {key.isActive ? "Revoke" : "Authorize"}
                      </DropdownMenuItem>
                      <Separator className="my-1 opacity-50" />
                      <DropdownMenuItem className="rounded-lg h-10 px-3 font-bold uppercase text-xs tracking-widest text-destructive" onClick={() => setDeleteConfirm(key.id)}>
                         <Trash2 className="mr-2 size-4" />
                         Purge
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="py-24 text-center border border-dashed rounded-3xl border-border/40 bg-muted/5 flex flex-col items-center justify-center">
             <Key className="size-10 text-muted-foreground/20 mb-4" />
             <h3 className="text-xl font-black tracking-tight uppercase italic opacity-40">Vault Empty</h3>
             <Button variant="outline" size="sm" className="mt-6 h-10 px-8 rounded-xl font-bold uppercase text-xs" onClick={() => setOpen(true)}>
                Provision First Key
             </Button>
          </div>
        )}
      </div>

      <AlertDialog open={deleteConfirm !== null} onOpenChange={(o) => !o && setDeleteConfirm(null)}>
        <AlertDialogContent className="bg-card border-border rounded-2xl p-8 max-w-sm shadow-2xl">
          <AlertDialogHeader className="space-y-4 text-center">
             <div className="size-14 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive mx-auto border border-destructive/20">
                <Trash2 className="size-7" />
             </div>
             <AlertDialogTitle className="text-xl font-black tracking-tight uppercase italic py-0.5">Purge Identity?</AlertDialogTitle>
             <AlertDialogDescription className="text-xs font-bold uppercase tracking-wider text-muted-foreground opacity-70">
               This operation is permanent and cannot be reversed.
             </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-3 mt-8">
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90 h-11 rounded-xl font-bold uppercase text-xs tracking-widest" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
               Confirm Purge
            </AlertDialogAction>
            <AlertDialogCancel className="h-10 rounded-xl font-bold uppercase text-xs tracking-widest border-none hover:bg-muted transition-all">Cancel</AlertDialogCancel>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
