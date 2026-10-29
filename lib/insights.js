// Industry-insight generation shared by the onboarding/dashboard server
// actions and the weekly Inngest refresh job.
//
// This module is intentionally NOT a "use server" file: exporting the
// generator from a server-actions file would make it a publicly callable
// endpoint with no auth check. Keeping it here means only trusted server code
// can invoke it.

import { generateText } from "@/lib/gemini";
import { industryInsightSchema } from "@/app/lib/schema";

export function buildInsightsPrompt(industry) {
  return `
          Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
          {
            "salaryRanges": [
              { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
            ],
            "growthRate": number,
            "demandLevel": "High" | "Medium" | "Low",
            "topSkills": ["skill1", "skill2"],
            "marketOutlook": "Positive" | "Neutral" | "Negative",
            "keyTrends": ["trend1", "trend2"],
            "recommendedSkills": ["skill1", "skill2"]
          }

          IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
          Include at least 5 common roles for salary ranges.
          Growth rate should be a percentage.
          Include at least 5 skills and trends.
        `;
}

/** Strip ```json fences the model sometimes adds and parse the payload. */
export function parseInsightsJson(text) {
  const cleaned = (text || "").replace(/```(?:json)?\n?/g, "").trim();
  let raw;
  try {
    raw = JSON.parse(cleaned);
  } catch {
    console.error("[insights] model returned non-JSON:", cleaned.slice(0, 200));
    throw new Error(
      "The AI returned an unreadable response. Please try again."
    );
  }
  const parsed = industryInsightSchema.safeParse(raw);
  if (!parsed.success) {
    console.error("[insights] JSON failed validation:", parsed.error.flatten());
    throw new Error(
      "The AI returned incomplete industry data. Please try again."
    );
  }
  return parsed.data;
}

/**
 * Generate validated industry insights for the given industry key
 * (e.g. "tech-software-development"). Uses the retrying Gemini client so a
 * transient 429/503 does not fail onboarding.
 */
export async function generateAIInsights(industry) {
  if (!industry || typeof industry !== "string") {
    throw new Error("An industry is required to generate insights.");
  }
  const text = await generateText(buildInsightsPrompt(industry), {
    temperature: 0.4,
    responseMimeType: "application/json",
  });
  return parseInsightsJson(text);
}

/** Row payload for creating/updating an IndustryInsight. */
export function insightRowData(industry, insights) {
  return {
    industry,
    ...insights,
    lastUpdated: new Date(),
    nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  };
}
