import { withAccelerate } from "@prisma/extension-accelerate";

import { PrismaClient } from "@/lib/generated/prisma/client";

export const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
}).$extends(withAccelerate());
