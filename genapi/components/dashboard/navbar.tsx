"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Key,
  Activity,
  Settings,
  LogOut,
  Menu,
  X,
  Zap,
  Wifi,
  Sparkles,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  username: string;
  ollamaStatus?: "online" | "offline";
}

export function Navbar({ username, ollamaStatus = "offline" }: NavbarProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <nav className="border-b border-slate-700 bg-slate-800 shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="h-6 w-6 text-blue-500" />
            <h1 className="text-xl font-bold text-white">LocalAI API</h1>
          </div>

          <div className="hidden items-center gap-4 md:flex">
            <div className="flex items-center gap-2 rounded-full bg-slate-700 px-3 py-1.5 text-sm">
              <div
                className={`h-2 w-2 rounded-full ${
                  ollamaStatus === "online" ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="text-slate-300">
                Ollama {ollamaStatus === "online" ? "Online" : "Offline"}
              </span>
            </div>

            <div className="border-l border-slate-600 pl-4">
              <span className="text-sm text-slate-400">Welcome,</span>
              <p className="font-semibold text-white">{username}</p>
            </div>

            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:bg-slate-700 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden"
          >
            {open ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <Menu className="h-6 w-6 text-white" />
            )}
          </button>
        </div>

        {open && (
          <div className="border-t border-slate-700 py-4 md:hidden">
            <div className="mb-4 flex flex-col gap-2">
              <div className="text-sm text-slate-400">Welcome</div>
              <p className="font-semibold text-white">{username}</p>
              <div className="flex items-center gap-2 text-sm">
                <div
                  className={`h-2 w-2 rounded-full ${
                    ollamaStatus === "online" ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <span className="text-slate-300">
                  Ollama {ollamaStatus === "online" ? "Online" : "Offline"}
                </span>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="w-full justify-start text-slate-300 hover:bg-slate-700 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}

interface SidebarProps {
  username: string;
}

export function Sidebar({ username }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/dashboard/generate", label: "Generate", icon: Sparkles },
    { href: "/dashboard/models", label: "Models", icon: Wifi },
    { href: "/dashboard/api-keys", label: "API Keys", icon: Key },
    { href: "/dashboard/usage", label: "Usage Logs", icon: Activity },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="fixed left-0 top-16 hidden h-[calc(100vh-64px)] w-64 border-r border-slate-700 bg-slate-800 md:flex md:flex-col">
      <nav className="space-y-2 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 ${
                  isActive
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "text-slate-400 hover:bg-slate-700 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-700 p-4">
        <div className="rounded-lg bg-slate-700 p-3 text-sm">
          <p className="text-slate-400">Logged in as</p>
          <p className="font-semibold text-white">{username}</p>
        </div>
      </div>
    </aside>
  );
}
