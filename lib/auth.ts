import { customSession } from "better-auth/plugins";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { PrismaClient } from "@/lib/generated/prisma/client";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [
    customSession(async ({ session }) => {
      const userId = session?.userId;

      if (!userId) {
        throw new Error("User ID not found in session");
      }

      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!currentUser) {
        throw new Error("User not found in database");
      }

      const userSession = {
        ...session,
        role: currentUser.role,
        isVerified: currentUser.emailVerified,
      };

      return {
        session: userSession,
      };
    }),
  ],
});
