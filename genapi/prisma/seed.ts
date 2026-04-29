import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Create default user
  const hashedPassword = await bcrypt.hash("1112", 10);

  const user = await prisma.user.upsert({
    where: { username: "notshubham" },
    update: {},
    create: {
      username: "notshubham",
      passwordHash: hashedPassword,
    },
  });

  // Create default settings
  const settings = await prisma.settings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      defaultModel: "llama2",
      maxRequestsPerMinute: 60,
      autoDisableAbuseKeys: true,
    },
  });

  console.log("Seed completed!");
  console.log("Default user created:", user);
  console.log("Default settings created:", settings);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
