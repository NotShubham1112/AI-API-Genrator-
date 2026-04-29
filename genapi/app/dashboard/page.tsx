import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";

export default async function DashboardPage() {
  await requireAuth();
  redirect("/dashboard/api");
}
