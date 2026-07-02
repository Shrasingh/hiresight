// Single, shared Google Gemini client for the whole app (DRY).
//
// Why this file exists:
//  - The legacy model `gemini-1.5-flash` was retired and returns 404 on the
//    Generative Language API. Centralizing the model name means we fix/upgrade
//    it in ONE place instead of six.
//  - `gemini-2.5-flash` is verified working against this project's API key.
//    Override the primary via GEMINI_MODEL; override the fallback chain via
//    GEMINI_FALLBACK_MODELS (comma-separated).
//
// Reliability: the Gemini endpoint intermittently returns transient errors
// (503 "high demand", 429, 5xx). `generateText` retries with exponential
// backoff and, if the primary model stays overloaded, falls back to another
// model — so a demand spike no longer fails the whole request.
//
// The installed SDK is `@google/generative-ai` (v1beta). It is functional but
// legacy; a future migration to `@google/genai` is recommended, not required.

import { GoogleGenerativeAI } from "@google/generative-ai";
import { classifyGeminiError } from "@/lib/errors";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const FALLBACK_MODELS = (
  process.env.GEMINI_FALLBACK_MODELS || "gemini-flash-latest,gemini-2.0-flash"
)
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);

// HTTP statuses worth retrying (transient upstream conditions).
const TRANSIENT_STATUSES = new Set([429, 500, 502, 503, 504]);
const MAX_ATTEMPTS_PER_MODEL = 3;

/** Get a configured model instance (optionally with generationConfig, etc.). */
export function getGeminiModel(overrides = {}) {
  return genAI.getGenerativeModel({ model: GEMINI_MODEL, ...overrides });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Best-effort HTTP status extraction from an SDK/network error. */
function getStatus(error) {
  if (error?.status) return error.status;
  if (error?.statusCode) return error.statusCode;
  const m = /\b(4\d\d|5\d\d)\b/.exec(error?.message || "");
  return m ? Number(m[1]) : undefined;
}

function isTransient(error) {
  const status = getStatus(error);
  if (status && TRANSIENT_STATUSES.has(status)) return true;
  const msg = (error?.message || "").toLowerCase();
  return (
    msg.includes("overloaded") ||
    msg.includes("high demand") ||
    msg.includes("service unavailable") ||
    msg.includes("fetch failed") ||
    msg.includes("timeout") ||
    msg.includes("econnreset")
  );
}

/** Model-specific failure (404/400) — retrying the SAME model won't help. */
function isModelUnavailable(error) {
  const status = getStatus(error);
  return status === 404 || status === 400;
}

/** Exponential backoff with jitter: ~0.6s, ~1.4s, ~3s. */
function backoffMs(attempt) {
  const base = 400 * Math.pow(2, attempt); // attempt starts at 1
  return base + Math.floor(Math.random() * 400);
}

function extractText(result) {
  let text;
  try {
    text = result?.response?.text?.().trim();
  } catch (error) {
    // .text() throws when the candidate was blocked / had no content.
    const err = new Error("BLOCKED_OR_EMPTY");
    err.cause = error;
    err.promptFeedback = result?.response?.promptFeedback;
    throw err;
  }
  return text;
}

/**
 * Generate text with retries + model fallback and typed error handling.
 *  - Logs full technical detail on the server.
 *  - Throws an Error whose message is safe to show to the user.
 *
 * @param {string} prompt
 * @param {object} [generationConfig] - e.g. { temperature, maxOutputTokens }
 * @returns {Promise<string>} trimmed model text
 */
export async function generateText(prompt, generationConfig) {
  const modelNames = [
    GEMINI_MODEL,
    ...FALLBACK_MODELS.filter((m) => m !== GEMINI_MODEL),
  ];
  let lastError;

  for (const name of modelNames) {
    const model = genAI.getGenerativeModel({
      model: name,
      ...(generationConfig ? { generationConfig } : {}),
    });

    for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_MODEL; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        const text = extractText(result);
        if (!text) {
          console.error(
            `[Gemini] ${name} returned empty text. promptFeedback:`,
            JSON.stringify(result?.response?.promptFeedback || {})
          );
          // Empty/blocked is not fixable by retry → surface immediately.
          throw new Error(
            "The AI returned an empty response. Please refine your input and try again."
          );
        }
        if (name !== GEMINI_MODEL) {
          console.warn(`[Gemini] served via fallback model "${name}".`);
        }
        return text;
      } catch (error) {
        lastError = error;

        // Blocked/empty content — do not retry, do not fall back.
        if (error?.message === "BLOCKED_OR_EMPTY") {
          console.error(
            `[Gemini] ${name} blocked/empty:`,
            JSON.stringify(error.promptFeedback || {})
          );
          throw new Error(
            "The AI couldn't produce a response for this input. Please adjust your details and try again."
          );
        }
        if (
          typeof error?.message === "string" &&
          error.message.startsWith("The AI returned an empty response")
        ) {
          throw error;
        }

        const status = getStatus(error);
        console.error(
          `[Gemini] ${name} attempt ${attempt}/${MAX_ATTEMPTS_PER_MODEL} failed (status ${status ?? "?"}):`,
          error?.message
        );

        // Model-specific (404/400): stop retrying this model, try the next one.
        if (isModelUnavailable(error)) break;

        // Non-transient (e.g. 401/403 auth/quota-permanent): give up entirely.
        if (!isTransient(error)) {
          throw new Error(classifyGeminiError(error));
        }

        // Transient: back off and retry the same model.
        if (attempt < MAX_ATTEMPTS_PER_MODEL) {
          await sleep(backoffMs(attempt));
        }
      }
    }
    // Exhausted this model's retries → fall through to next fallback model.
  }

  console.error("[Gemini] all models/retries exhausted.");
  throw new Error(classifyGeminiError(lastError));
}
