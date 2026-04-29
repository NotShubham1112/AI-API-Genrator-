"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Brain, Lock, User, Loader2, ArrowRight } from "lucide-react";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [username, setUsername] = useState("notshubham");
  const [password, setPassword] = useState("1112");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        router.push("/dashboard/api");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Invalid credentials");
      }
    } catch (err) {
      setError("Connection error. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 mb-4">
        <div className="size-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-2xl shadow-primary/40 mb-2">
           <Brain className="size-7" />
        </div>
        <h1 className="text-3xl font-black tracking-tighter">WORKSPACE</h1>
        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.3em]">Local AI API Console</p>
      </div>

      <Card className="border-border/60 bg-card/40 backdrop-blur-xl shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
        <CardHeader className="space-y-1 pt-8">
          <CardTitle className="text-xl font-bold text-center">Identity Verification</CardTitle>
          <CardDescription className="text-center text-xs">
            Authorized personnel only. Enter credentials to proceed.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 pb-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Username</Label>
                <div className="relative group">
                  <User className="absolute left-3 top-3 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="username"
                    placeholder="shubham"
                    className="pl-10 h-11 bg-background/50 border-border/60 focus-visible:ring-primary/20"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Security Key</Label>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-3 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input 
                    id="password" 
                    type="password" 
                    className="pl-10 h-11 bg-background/50 border-border/60 focus-visible:ring-primary/20"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold text-center animate-shake">
                {error}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full h-11 font-black uppercase tracking-widest shadow-xl shadow-primary/20 group">
              {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : (
                <>
                  Establish Session
                  <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <p className="text-center text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
        &copy; 2026 WorkSpace AI Engine
      </p>
    </div>
  );
}
