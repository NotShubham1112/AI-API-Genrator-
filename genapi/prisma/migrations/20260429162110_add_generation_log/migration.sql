-- CreateTable
CREATE TABLE "GenerationLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "model" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "output" TEXT NOT NULL,
    "tokens" INTEGER NOT NULL,
    "latency" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Settings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "defaultModel" TEXT NOT NULL DEFAULT 'llama3.2',
    "maxRequestsPerMinute" INTEGER NOT NULL DEFAULT 60,
    "globalTokenCap" INTEGER,
    "autoDisableAbuseKeys" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Settings" ("autoDisableAbuseKeys", "defaultModel", "globalTokenCap", "id", "maxRequestsPerMinute", "updatedAt") SELECT "autoDisableAbuseKeys", "defaultModel", "globalTokenCap", "id", "maxRequestsPerMinute", "updatedAt" FROM "Settings";
DROP TABLE "Settings";
ALTER TABLE "new_Settings" RENAME TO "Settings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "GenerationLog_model_idx" ON "GenerationLog"("model");

-- CreateIndex
CREATE INDEX "GenerationLog_createdAt_idx" ON "GenerationLog"("createdAt");
