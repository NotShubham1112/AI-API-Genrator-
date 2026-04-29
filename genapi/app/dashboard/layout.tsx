import { ReactNode } from "react";
import { requireAuth } from "@/lib/auth";
import { getOllamaStatus } from "@/lib/ollama";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Brain, Boxes } from "lucide-react";
import { prisma } from "@/lib/db";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const user = await requireAuth();
  const ollamaStatus = await getOllamaStatus();
  const settings = await prisma.settings.findUnique({ where: { id: "default" } });

  const userData = {
    name: user.username,
    email: `${user.username.toLowerCase()}@local.ai`,
    avatar: "",
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-white">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-6 sticky top-0 bg-white/80 backdrop-blur-md z-10">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4 mx-2" />
          <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold tracking-tight text-foreground">Workspace</span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-secondary text-[10px] font-medium border">
                  <span className={`h-1.5 w-1.5 rounded-full ${ollamaStatus.status === "online" ? "bg-emerald-500" : "bg-rose-500"}`} />
                  Ollama {ollamaStatus.status === "online" ? "Online" : "Offline"}
                </div>
                {settings?.defaultModel && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-secondary text-[10px] font-medium border">
                    <Brain className="h-3 w-3 text-muted-foreground" />
                    {settings.defaultModel}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-xs font-medium text-foreground">{userData.name}</span>
                <span className="text-[10px] text-muted-foreground">{userData.email}</span>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}