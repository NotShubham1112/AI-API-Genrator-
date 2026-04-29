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
import { Brain, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <AppSidebar user={userData} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4 transition-[width,height] ease-linear">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-foreground">Local AI API</span>
              <div className="hidden items-center gap-2 md:flex">
                <Badge
                  variant="outline"
                  className={`${
                    ollamaStatus.status === "online"
                      ? "border-green-500/50 bg-green-500/10 text-green-500"
                      : "border-red-500/50 bg-red-500/10 text-red-500"
                  }`}
                >
                  <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                    ollamaStatus.status === "online" ? "bg-green-500" : "bg-red-500"
                  }`} />
                  Ollama {ollamaStatus.status === "online" ? "Online" : "Offline"}
                </Badge>
                {settings?.defaultModel && (
                  <Badge variant="outline" className="border-blue-500/50 bg-blue-500/10 text-blue-500">
                    <Brain className="mr-1.5 h-3 w-3" />
                    {settings.defaultModel}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Right side header actions if needed */}
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
