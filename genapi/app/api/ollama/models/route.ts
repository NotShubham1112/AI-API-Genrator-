import { NextResponse } from "next/server";
import { getInstalledModels, getOllamaStatus } from "@/lib/utils-auth";

export async function GET() {
  try {
    const [status, models] = await Promise.all([
      getOllamaStatus(),
      getInstalledModels(),
    ]);

    return NextResponse.json({ status: status.status, models });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch models" },
      { status: 500 }
    );
  }
}
