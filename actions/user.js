"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateAIInsights, insightRowData } from "@/lib/insights";
import { onboardingServerSchema } from "@/app/lib/schema";
import { dbErrorMessage, isAuthError, isDbError } from "@/lib/errors";

export async function updateUser(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const parsed = onboardingServerSchema.safeParse(data);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    throw new Error(first?.message || "Invalid profile details");
  }
  const { industry, experience, bio, skills } = parsed.data;

  try {
    const user = await db.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) throw new Error("User not found");

    // Generate insights for a new industry BEFORE opening the transaction.
    // The AI call can take longer than the interactive-transaction timeout,
    // which previously surfaced as "Failed to update profile".
    const existingInsight = await db.industryInsight.findUnique({
      where: { industry },
    });
    const freshInsights = existingInsight
      ? null
      : await generateAIInsights(industry);

    const updatedUser = await db.$transaction(async (tx) => {
      if (freshInsights) {
        await tx.industryInsight.upsert({
          where: { industry },
          update: insightRowData(industry, freshInsights),
          create: insightRowData(industry, freshInsights),
        });
      }
      return tx.user.update({
        where: { id: user.id },
        data: {
          industry,
          experience,
          bio: bio ?? null,
          skills: skills ?? [],
        },
      });
    });

    revalidatePath("/");
    revalidatePath("/dashboard");
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("[user] updateUser failed:", error);
    if (isAuthError(error)) throw error;
    if (isDbError(error)) throw new Error(dbErrorMessage(error));
    // AI errors from lib/insights are already user-friendly.
    throw new Error(error?.message || "Failed to update profile");
  }
}

export async function getUserOnboardingStatus() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { industry: true },
    });
    if (!user) throw new Error("User not found");

    return { isOnboarded: !!user.industry };
  } catch (error) {
    console.error("[user] onboarding status failed:", error);
    if (isAuthError(error)) throw error;
    if (isDbError(error)) throw new Error(dbErrorMessage(error));
    throw new Error("Failed to check onboarding status");
  }
}
