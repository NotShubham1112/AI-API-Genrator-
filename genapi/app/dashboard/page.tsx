import { requireAuth } from "@/lib/auth";
import { ApiKeysClient } from "@/components/dashboard/api-keys-client";
import { getInstalledModels } from "@/lib/ollama";

export default async function DashboardPage() {
  await requireAuth();
  const models = await getInstalledModels();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
        <p className="text-muted-foreground">
          Manage access keys for local AI models. Use these keys to authenticate your requests.
        </p>
      </div>
      <ApiKeysClient initialModels={models} />
    </div>
  );
}
