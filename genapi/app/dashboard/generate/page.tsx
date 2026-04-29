import { requireAuth } from "@/lib/auth";
import { GenerateClient } from "@/components/dashboard/generate-client";

export default async function GeneratePage() {
  await requireAuth();

  return <GenerateClient />;
}