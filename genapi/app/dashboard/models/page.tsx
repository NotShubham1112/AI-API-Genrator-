import { requireAuth } from "@/lib/auth";
import { ModelsClient } from "@/components/dashboard/models-client";

export default async function ModelsPage() {
  await requireAuth();

  return <ModelsClient />;
}
