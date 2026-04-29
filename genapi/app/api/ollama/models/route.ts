import { NextResponse } from "next/server";
import { getInstalledModels, getOllamaStatus } from "@/lib/ollama";

export async function GET() {
  try {
    const [status, models] = await Promise.all([
      getOllamaStatus(),
      getInstalledModels(),
    ]);

    return NextResponse.json({
      status: status.status,
      version: status.version,
      models,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch models", status: "offline", models: [] },
      { status: 500 }
    );
  }
}