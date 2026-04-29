import { ReactNode } from "react";
import { requireAuth } from "@/lib/auth";
import { Navbar, Sidebar } from "@/components/dashboard/navbar";
import { getOllamaStatus } from "@/lib/utils-auth";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const user = await requireAuth();
  const ollamaStatus = await getOllamaStatus();

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar username={user.username} ollamaStatus={ollamaStatus.status} />
      <Sidebar username={user.username} />

      <main className="md:ml-64">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
