import { z } from "zod";

export const onboardingSchema = z.object({
  industry: z.string({
    required_error: "Please select an industry",
  }),
  subIndustry: z.string({
    required_error: "Please select a specialization",
  }),
  bio: z.string().max(500).optional(),
  experience: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(
      z
        .number()
        .min(0, "Experience must be at least 0 years")
        .max(50, "Experience cannot exceed 50 years")
    ),
  skills: z.string().transform((val) =>
    val
      ? val
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean)
      : undefined
  ),
});

export const contactSchema = z.object({
  email: z.string().email("Invalid email address"),
  mobile: z.string().optional(),
  linkedin: z.string().optional(),
  twitter: z.string().optional(),
  github: z.string().optional(),
  portfolio: z.string().optional(),
});

export const entrySchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    organization: z.string().min(1, "Organization is required"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional(),
    description: z.string().min(1, "Description is required"),
    current: z.boolean().default(false),
  })
  .refine(
    (data) => {
      if (!data.current && !data.endDate) {
        return false;
      }
      return true;
    },
    {
      message: "End date is required unless this is your current position",
      path: ["endDate"],
    }
  );

export const resumeSchema = z.object({
  contactInfo: contactSchema,
  summary: z.string().min(1, "Professional summary is required"),
  skills: z.string().min(1, "Skills are required"),
  experience: z.array(entrySchema),
  education: z.array(entrySchema),
  projects: z.array(entrySchema),
});

export const coverLetterSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  jobDescription: z.string().min(1, "Job description is required"),
});

// ---------------------------------------------------------------------------
// Server-side schemas (validate what server actions actually receive).
// ---------------------------------------------------------------------------

/** Payload sent by the onboarding form AFTER the client-side transforms. */
export const onboardingServerSchema = z.object({
  // Combined "<industryId>-<sub-industry-slug>" key, e.g.
  // "tech-software-development" or "tech-data-science-&-analytics".
  industry: z.string().trim().min(1, "Please select an industry").max(120),
  experience: z
    .number({ invalid_type_error: "Experience must be a number" })
    .int()
    .min(0, "Experience must be at least 0 years")
    .max(50, "Experience cannot exceed 50 years"),
  bio: z.string().max(500).optional().nullable(),
  skills: z.array(z.string().trim().min(1).max(60)).max(50).optional(),
});

/** Shape of the JSON the AI must return for an industry. Mirrors the
 *  IndustryInsight Prisma model so a malformed response never reaches the DB. */
export const industryInsightSchema = z.object({
  salaryRanges: z
    .array(
      z.object({
        role: z.string(),
        min: z.number(),
        max: z.number(),
        median: z.number(),
        location: z.string().optional().default(""),
      })
    )
    .min(1),
  growthRate: z.number(),
  demandLevel: z.enum(["High", "Medium", "Low"]),
  topSkills: z.array(z.string()).min(1),
  marketOutlook: z.enum(["Positive", "Neutral", "Negative"]),
  keyTrends: z.array(z.string()).min(1),
  recommendedSkills: z.array(z.string()).min(1),
});

/** Shape of the quiz the AI must return for a mock interview. */
export const quizSchema = z.object({
  questions: z
    .array(
      z.object({
        question: z.string().min(1),
        options: z.array(z.string()).length(4),
        correctAnswer: z.string().min(1),
        explanation: z.string().default(""),
      })
    )
    .min(1),
});
