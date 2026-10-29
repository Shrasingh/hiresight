import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

/**
 * Ensure the signed-in Clerk user has a row in our database.
 * Returns the DB user, or null when signed out or when the DB is unreachable
 * (callers treat null as "not available" and the actions surface a friendly
 * error on their own).
 */
export const checkUser = async () => {
  const user = await currentUser();
  if (!user) return null;

  try {
    const loggedInUser = await db.user.findUnique({
      where: { clerkUserId: user.id },
    });
    if (loggedInUser) return loggedInUser;

    const email =
      user.primaryEmailAddress?.emailAddress ||
      user.emailAddresses?.[0]?.emailAddress;
    if (!email) {
      console.error("[checkUser] Clerk user has no email address:", user.id);
      return null;
    }

    const name =
      [user.firstName, user.lastName].filter(Boolean).join(" ") ||
      user.username ||
      email.split("@")[0];

    return await db.user.create({
      data: {
        clerkUserId: user.id,
        name,
        imageUrl: user.imageUrl,
        email,
      },
    });
  } catch (error) {
    // Unique-email race (two concurrent first requests) -> row now exists.
    if (error?.code === "P2002") {
      try {
        return await db.user.findUnique({ where: { clerkUserId: user.id } });
      } catch {
        /* fall through */
      }
    }
    console.error("[checkUser] failed:", error?.message || error);
    return null;
  }
};
