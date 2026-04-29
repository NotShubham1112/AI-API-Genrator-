import { requireAuth } from "@/lib/auth";
import { ApiKeysClient } from "@/components/dashboard/api-keys-client";
import { getInstalledModels } from "@/lib/ollama";

export default async function ApiPage() {
  await requireAuth();
  const models = await getInstalledModels();

  return <ApiKeysClient initialModels={models} />;
}
