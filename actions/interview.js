"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { generateText } from "@/lib/gemini";
import { quizSchema } from "@/app/lib/schema";
import { dbErrorMessage, isAuthError, isDbError } from "@/lib/errors";

async function getCurrentUser(select) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  let user;
  try {
    user = await db.user.findUnique({
      where: { clerkUserId: userId },
      ...(select ? { select } : {}),
    });
  } catch (error) {
    console.error("[interview] user lookup failed:", error);
    throw new Error(dbErrorMessage(error));
  }
  if (!user) throw new Error("User not found");
  return user;
}

export async function generateQuiz() {
  const user = await getCurrentUser({ industry: true, skills: true });
  if (!user.industry) throw new Error("Please complete onboarding first.");

  const prompt = `
    Generate 10 technical interview questions for a ${
      user.industry
    } professional${
    user.skills?.length ? ` with expertise in ${user.skills.join(", ")}` : ""
  }.

    Each question should be multiple choice with 4 options.

    Return the response in this JSON format only, no additional text:
    {
      "questions": [
        {
          "question": "string",
          "options": ["string", "string", "string", "string"],
          "correctAnswer": "string",
          "explanation": "string"
        }
      ]
    }
  `;

  try {
    const text = await generateText(prompt, {
      temperature: 0.7,
      responseMimeType: "application/json",
    });
    const cleaned = text.replace(/```(?:json)?\n?/g, "").trim();
    const parsed = quizSchema.safeParse(JSON.parse(cleaned));
    if (!parsed.success) {
      console.error("[interview] quiz failed validation:", parsed.error.flatten());
      throw new Error("The AI returned an incomplete quiz. Please try again.");
    }
    return parsed.data.questions;
  } catch (error) {
    console.error("[interview] generateQuiz failed:", error);
    if (error instanceof SyntaxError) {
      throw new Error("The AI returned an unreadable quiz. Please try again.");
    }
    throw new Error(error?.message || "Failed to generate quiz questions");
  }
}

export async function saveQuizResult(questions, answers) {
  const user = await getCurrentUser();

  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("No quiz questions to save.");
  }
  if (!Array.isArray(answers) || answers.length !== questions.length) {
    throw new Error("Please answer every question before finishing.");
  }

  const questionResults = questions.map((q, index) => ({
    question: q.question,
    answer: q.correctAnswer,
    userAnswer: answers[index],
    isCorrect: q.correctAnswer === answers[index],
    explanation: q.explanation,
  }));

  // Score is computed on the server from the answers, never trusted from
  // the client.
  const correctCount = questionResults.filter((q) => q.isCorrect).length;
  const score = (correctCount / questionResults.length) * 100;

  const wrongAnswers = questionResults.filter((q) => !q.isCorrect);

  // Only generate improvement tips if there are wrong answers
  let improvementTip = null;
  if (wrongAnswers.length > 0) {
    const wrongQuestionsText = wrongAnswers
      .map(
        (q) =>
          `Question: "${q.question}"\nCorrect Answer: "${q.answer}"\nUser Answer: "${q.userAnswer}"`
      )
      .join("\n\n");

    const improvementPrompt = `
      The user got the following ${user.industry} technical interview questions wrong:

      ${wrongQuestionsText}

      Based on these mistakes, provide a concise, specific improvement tip.
      Focus on the knowledge gaps revealed by these wrong answers.
      Keep the response under 2 sentences and make it encouraging.
      Don't explicitly mention the mistakes, instead focus on what to learn/practice.
    `;

    try {
      improvementTip = await generateText(improvementPrompt, {
        temperature: 0.6,
        maxOutputTokens: 200,
      });
    } catch (error) {
      // Non-fatal: the result is still saved without a tip.
      console.error("[interview] improvement tip failed (non-fatal):", error);
    }
  }

  try {
    return await db.assessment.create({
      data: {
        userId: user.id,
        quizScore: score,
        questions: questionResults,
        category: "Technical",
        improvementTip,
      },
    });
  } catch (error) {
    console.error("[interview] saveQuizResult failed:", error);
    if (isDbError(error)) throw new Error(dbErrorMessage(error));
    throw new Error("Failed to save quiz result");
  }
}

export async function getAssessments() {
  const user = await getCurrentUser({ id: true });

  try {
    return await db.assessment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    });
  } catch (error) {
    console.error("[interview] getAssessments failed:", error);
    if (isAuthError(error)) throw error;
    throw new Error(dbErrorMessage(error));
  }
}
