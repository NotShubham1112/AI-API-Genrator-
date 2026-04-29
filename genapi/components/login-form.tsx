"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Boxes } from "lucide-react";

export function LoginForm() {
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
        router.push("/dashboard/api-keys");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Invalid credentials");
      }
    } catch {
      setError("Connection error. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-sm mx-auto">
      <div className="flex flex-col items-center gap-3">
        <div className="size-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
          <Boxes className="size-6" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">LocalAI API</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to your admin console</p>
        </div>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username" className="text-sm font-medium">Username</Label>
          <Input
            id="username"
            placeholder="Enter username"
            className="h-10"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">Password</Label>
          <Input
            id="password"
            type="password"
            className="h-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
            {error}
          </div>
        )}

        <Button type="submit" disabled={loading} className="w-full h-10">
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </div>
  );
}