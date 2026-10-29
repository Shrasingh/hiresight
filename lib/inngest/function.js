import { db } from "@/lib/prisma";
import { inngest } from "./client";
import { getGeminiModel } from "@/lib/gemini";
import {
  buildInsightsPrompt,
  insightRowData,
  parseInsightsJson,
} from "@/lib/insights";

const model = getGeminiModel();

export const generateIndustryInsights = inngest.createFunction(
  { name: "Generate Industry Insights" },
  { cron: "0 0 * * 0" }, // Run every Sunday at midnight
  async ({ step }) => {
    const industries = await step.run("Fetch industries", async () => {
      return await db.industryInsight.findMany({
        select: { industry: true },
      });
    });

    for (const { industry } of industries) {
      const res = await step.ai.wrap(
        "gemini",
        async (p) => {
          return await model.generateContent(p);
        },
        buildInsightsPrompt(industry)
      );

      const text = res.response.candidates[0].content.parts[0].text || "";
      // Same parsing + schema validation as the on-demand path, so a bad
      // model response fails this step (and is retried) instead of writing
      // malformed data.
      const insights = parseInsightsJson(text);

      await step.run(`Update ${industry} insights`, async () => {
        await db.industryInsight.update({
          where: { industry },
          data: insightRowData(industry, insights),
        });
      });
    }
  }
);
