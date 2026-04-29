import { requireAuth } from "@/lib/auth";
import { ApiKeysClient } from "@/components/dashboard/api-keys-client";

export default async function ApiKeysPage() {
  await requireAuth();

  return <ApiKeysClient />;
}
