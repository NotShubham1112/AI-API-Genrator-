import { requireAuth } from "@/lib/auth";
import { SettingsClient } from "@/components/dashboard/settings-client";

export default async function SettingsPage() {
  await requireAuth();

  return <SettingsClient />;
}
