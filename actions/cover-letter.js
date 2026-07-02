"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateText } from "@/lib/gemini";
import { dbErrorMessage, isDbError, isAuthError } from "@/lib/errors";

/**
 * Resolve the authenticated app user (Clerk id -> DB row).
 * Throws friendly auth errors; maps DB reachability errors.
 */
async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  let user;
  try {
    user = await db.user.findUnique({ where: { clerkUserId: userId } });
  } catch (error) {
    console.error("[cover-letter] user lookup failed:", error);
    throw new Error(dbErrorMessage(error));
  }
  if (!user) throw new Error("User not found");
  return user;
}

/**
 * Build a high-quality, ATS-friendly, résumé-grounded prompt.
 * Shared by generate + regenerate so the two never drift (DRY).
 */
function buildCoverLetterPrompt({ user, resumeContent, data }) {
  const profile = [
    user.name && `- Name: ${user.name}`,
    user.industry && `- Industry: ${user.industry}`,
    typeof user.experience === "number" &&
      `- Years of experience: ${user.experience}`,
    user.skills?.length && `- Key skills: ${user.skills.join(", ")}`,
    user.bio && `- Professional background: ${user.bio}`,
  ]
    .filter(Boolean)
    .join("\n");

  return `You are an expert career coach and professional cover-letter writer.
Write a tailored, ATS-friendly cover letter in Markdown for the role below.

# ROLE
- Position: ${data.jobTitle}
- Company: ${data.companyName}

# JOB DESCRIPTION
${data.jobDescription}

# CANDIDATE PROFILE
${profile || "- (Limited profile provided)"}

# CANDIDATE RÉSUMÉ (authoritative source of facts)
${resumeContent ? resumeContent : "(No résumé on file — rely only on the profile above.)"}

# STRICT RULES
1. Use ONLY facts present in the candidate profile or résumé above. Do NOT invent employers, titles, dates, metrics, or achievements. If a metric is not provided, describe impact qualitatively rather than fabricating numbers.
2. Open with a strong, specific first paragraph that names the role and company and states a compelling reason for fit.
3. Map the candidate's real skills/experience to the specific requirements in the job description.
4. Prefer quantified achievements ONLY when they exist in the résumé; otherwise stay truthful.
5. Reference the company by name and reflect its domain/needs from the job description (company-specific wording, no generic filler).
6. Keep it concise: 3–4 short paragraphs, roughly 250–350 words.
7. Confident, professional, warm tone — never robotic, never exaggerated.
8. End with a compelling closing paragraph and a clear call to action.
9. ATS-friendly: plain Markdown, standard business-letter structure, no tables, no images, no emojis.

# OUTPUT
Return ONLY the cover letter in Markdown (salutation, body paragraphs, and sign-off). Do not include commentary, notes, or code fences.`;
}

/** Fetch the user's saved résumé content for grounding (best-effort). */
async function getResumeContent(userId) {
  try {
    const resume = await db.resume.findUnique({ where: { userId } });
    return resume?.content || "";
  } catch (error) {
    // Non-fatal: proceed without résumé grounding.
    console.error("[cover-letter] résumé fetch failed (non-fatal):", error);
    return "";
  }
}

export async function generateCoverLetter(data) {
  try {
    const user = await getCurrentUser();
    const resumeContent = await getResumeContent(user.id);

    const prompt = buildCoverLetterPrompt({ user, resumeContent, data });
    const content = await generateText(prompt, {
      temperature: 0.6,
      maxOutputTokens: 1200,
    });

    const coverLetter = await db.coverLetter.create({
      data: {
        content,
        jobDescription: data.jobDescription,
        companyName: data.companyName,
        jobTitle: data.jobTitle,
        status: "completed",
        userId: user.id,
      },
    });

    revalidatePath("/ai-cover-letter");
    return coverLetter;
  } catch (error) {
    console.error("[cover-letter] generate failed:", error);
    if (isAuthError(error)) throw error;
    if (isDbError(error)) throw new Error(dbErrorMessage(error));
    throw error; // already a user-friendly AI message
  }
}

/** Regenerate an existing letter from its stored job details + latest profile. */
export async function regenerateCoverLetter(id) {
  try {
    const user = await getCurrentUser();

    const existing = await db.coverLetter.findUnique({
      where: { id, userId: user.id },
    });
    if (!existing) throw new Error("User not found"); // treated as auth/not-found

    const resumeContent = await getResumeContent(user.id);
    const prompt = buildCoverLetterPrompt({
      user,
      resumeContent,
      data: {
        jobTitle: existing.jobTitle,
        companyName: existing.companyName,
        jobDescription: existing.jobDescription || "",
      },
    });

    const content = await generateText(prompt, {
      temperature: 0.7,
      maxOutputTokens: 1200,
    });

    const updated = await db.coverLetter.update({
      where: { id, userId: user.id },
      data: { content, status: "completed" },
    });

    revalidatePath(`/ai-cover-letter/${id}`);
    revalidatePath("/ai-cover-letter");
    return updated;
  } catch (error) {
    console.error("[cover-letter] regenerate failed:", error);
    if (isAuthError(error)) throw error;
    if (isDbError(error)) throw new Error(dbErrorMessage(error));
    throw error;
  }
}

/** Save user-edited content for a letter. */
export async function updateCoverLetter(id, content) {
  try {
    const user = await getCurrentUser();

    const updated = await db.coverLetter.update({
      where: { id, userId: user.id },
      data: { content },
    });

    revalidatePath(`/ai-cover-letter/${id}`);
    revalidatePath("/ai-cover-letter");
    return updated;
  } catch (error) {
    console.error("[cover-letter] update failed:", error);
    if (isAuthError(error)) throw error;
    if (isDbError(error)) throw new Error(dbErrorMessage(error));
    throw new Error("Failed to save cover letter. Please try again.");
  }
}

export async function getCoverLetters() {
  const user = await getCurrentUser();
  try {
    return await db.coverLetter.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("[cover-letter] list failed:", error);
    throw new Error(dbErrorMessage(error));
  }
}

export async function getCoverLetter(id) {
  const user = await getCurrentUser();
  try {
    return await db.coverLetter.findUnique({
      where: { id, userId: user.id },
    });
  } catch (error) {
    console.error("[cover-letter] get failed:", error);
    throw new Error(dbErrorMessage(error));
  }
}

export async function deleteCoverLetter(id) {
  try {
    const user = await getCurrentUser();
    const deleted = await db.coverLetter.delete({
      where: { id, userId: user.id },
    });
    revalidatePath("/ai-cover-letter");
    return deleted;
  } catch (error) {
    console.error("[cover-letter] delete failed:", error);
    if (isAuthError(error)) throw error;
    if (isDbError(error)) throw new Error(dbErrorMessage(error));
    throw new Error("Failed to delete cover letter. Please try again.");
  }
}
