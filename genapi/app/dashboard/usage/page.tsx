import { requireAuth } from "@/lib/auth";
import { UsageLogsClient } from "@/components/dashboard/usage-logs-client";

export default async function UsageLogsPage() {
  await requireAuth();

  return <UsageLogsClient />;
}
