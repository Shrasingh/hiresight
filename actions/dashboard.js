"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { generateAIInsights, insightRowData } from "@/lib/insights";
import { dbErrorMessage, isAuthError, isDbError } from "@/lib/errors";

export async function getIndustryInsights() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      include: { industryInsight: true },
    });

    if (!user) throw new Error("User not found");
    if (!user.industry) throw new Error("Please complete onboarding first.");

    if (user.industryInsight) return user.industryInsight;

    // No insights yet for this industry: generate once and store them.
    // Upsert (not create) so two users onboarding into the same new industry
    // at the same time cannot trip the unique constraint.
    const insights = await generateAIInsights(user.industry);
    return await db.industryInsight.upsert({
      where: { industry: user.industry },
      update: insightRowData(user.industry, insights),
      create: insightRowData(user.industry, insights),
    });
  } catch (error) {
    console.error("[dashboard] insights failed:", error);
    if (isAuthError(error)) throw error;
    if (isDbError(error)) throw new Error(dbErrorMessage(error));
    throw error; // already user-friendly (from lib/insights or lib/gemini)
  }
}
