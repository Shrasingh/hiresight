"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { generateText } from "@/lib/gemini";
import { revalidatePath } from "next/cache";
import { dbErrorMessage, isDbError } from "@/lib/errors";

const MAX_RESUME_CHARS = 50_000;

async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  let user;
  try {
    user = await db.user.findUnique({ where: { clerkUserId: userId } });
  } catch (error) {
    console.error("[resume] user lookup failed:", error);
    throw new Error(dbErrorMessage(error));
  }
  if (!user) throw new Error("User not found");
  return user;
}

export async function saveResume(content) {
  const user = await getCurrentUser();

  if (typeof content !== "string" || !content.trim()) {
    throw new Error("Add some resume details before saving.");
  }
  if (content.length > MAX_RESUME_CHARS) {
    throw new Error("Resume is too long to save. Please shorten it.");
  }

  try {
    const resume = await db.resume.upsert({
      where: { userId: user.id },
      update: { content },
      create: { userId: user.id, content },
    });

    revalidatePath("/resume");
    return resume;
  } catch (error) {
    console.error("[resume] saveResume failed:", error);
    if (isDbError(error)) throw new Error(dbErrorMessage(error));
    throw new Error("Failed to save resume");
  }
}

export async function getResume() {
  const user = await getCurrentUser();

  try {
    return await db.resume.findUnique({ where: { userId: user.id } });
  } catch (error) {
    console.error("[resume] getResume failed:", error);
    throw new Error(dbErrorMessage(error));
  }
}

export async function improveWithAI({ current, type }) {
  const user = await getCurrentUser();

  if (typeof current !== "string" || !current.trim()) {
    throw new Error("Write a description first, then improve it with AI.");
  }
  const section = typeof type === "string" && type.trim() ? type : "entry";

  const prompt = `
    As an expert resume writer, improve the following ${section} description for a ${
      user.industry || "technology"
    } professional.
    Make it more impactful, quantifiable, and aligned with industry standards.
    Current content: "${current}"

    Requirements:
    1. Use action verbs
    2. Include metrics and results where possible
    3. Highlight relevant technical skills
    4. Keep it concise but detailed
    5. Focus on achievements over responsibilities
    6. Use industry-specific keywords

    Format the response as a single paragraph without any additional text or explanations.
  `;

  try {
    return await generateText(prompt, { temperature: 0.6, maxOutputTokens: 400 });
  } catch (error) {
    console.error("[resume] improveWithAI failed:", error);
    throw new Error(error?.message || "Failed to improve content");
  }
}
