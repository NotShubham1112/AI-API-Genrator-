import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export async function getUser(username: string) {
  return prisma.user.findUnique({
    where: { username },
  });
}

export async function getApiKeys(limit = 100, offset = 0) {
  return prisma.apiKey.findMany({
    take: limit,
    skip: offset,
    orderBy: { createdAt: "desc" },
  });
}

export async function getApiKeyById(id: string) {
  return prisma.apiKey.findUnique({
    where: { id },
  });
}

export async function getApiKeyByKey(key: string) {
  return prisma.apiKey.findUnique({
    where: { key },
  });
}

export async function getUsageLogs(limit = 50, offset = 0) {
  return prisma.usageLog.findMany({
    take: limit,
    skip: offset,
    orderBy: { createdAt: "desc" },
    include: { apiKey: { select: { name: true } } },
  });
}

export async function getSettings() {
  return prisma.settings.findUnique({
    where: { id: "default" },
  });
}

export async function updateSettings(data: {
  defaultModel?: string;
  maxRequestsPerMinute?: number;
  globalTokenCap?: number | null;
  autoDisableAbuseKeys?: boolean;
}) {
  return prisma.settings.update({
    where: { id: "default" },
    data,
  });
}
