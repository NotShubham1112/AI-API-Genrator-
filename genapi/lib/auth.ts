import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function createSession(userId: string): Promise<string> {
  const sessionId = Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  await prisma.session.create({
    data: {
      id: sessionId,
      userId,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set("sessionId", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION / 1000, // Convert to seconds
  });

  return sessionId;
}

export async function getSessionUser(): Promise<
  { id: string; username: string } | null
> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("sessionId")?.value;

    if (!sessionId) {
      return null;
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: { select: { id: true, username: true } } },
    });

    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    return session.user;
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("sessionId")?.value;

  if (sessionId) {
    await prisma.session.delete({
      where: { id: sessionId },
    }).catch(() => {
      // Session might not exist
    });

    cookieStore.delete("sessionId");
  }
}

export async function requireAuth() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}
