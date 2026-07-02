// Centralized error classification for server actions.
// Goal: log full technical detail on the server, return a short, safe,
// user-friendly message to the client. Never leak stack traces / keys / SQL.

/**
 * Map a Google Gemini / network error to a user-friendly message.
 * The raw error should be logged by the caller before calling this.
 */
export function classifyGeminiError(error) {
  const msg = (error?.message || String(error) || "").toLowerCase();
  const status = error?.status || error?.statusCode;

  // Invalid / missing API key or permission denied
  if (
    status === 400 ||
    status === 401 ||
    status === 403 ||
    msg.includes("api key not valid") ||
    msg.includes("api_key_invalid") ||
    msg.includes("permission denied") ||
    msg.includes("unauthenticated")
  ) {
    return "The AI service is not configured correctly. Please contact support.";
  }

  // Rate limit / quota exhausted
  if (
    status === 429 ||
    msg.includes("429") ||
    msg.includes("quota") ||
    msg.includes("resource_exhausted") ||
    msg.includes("rate limit")
  ) {
    return "AI usage limit reached. Please wait a minute and try again.";
  }

  // Service overloaded (high demand) — transient
  if (
    status === 503 ||
    msg.includes("503") ||
    msg.includes("overloaded") ||
    msg.includes("high demand") ||
    msg.includes("service unavailable")
  ) {
    return "The AI is experiencing high demand right now. Please try again in a moment.";
  }

  // Model unavailable / not found
  if (status === 404 || msg.includes("404") || msg.includes("not found")) {
    return "The AI model is temporarily unavailable. Please try again shortly.";
  }

  // Content blocked by safety filters
  if (msg.includes("safety") || msg.includes("blocked") || msg.includes("recitation")) {
    return "The request was blocked by the AI safety filters. Please rephrase your input.";
  }

  // Timeout
  if (msg.includes("timeout") || msg.includes("timed out") || msg.includes("etimedout") || msg.includes("deadline")) {
    return "The AI request timed out. Please try again.";
  }

  // Network / reachability
  if (
    status >= 500 ||
    msg.includes("fetch failed") ||
    msg.includes("network") ||
    msg.includes("enotfound") ||
    msg.includes("econnrefused") ||
    msg.includes("socket")
  ) {
    return "We couldn't reach the AI service. Check your connection and try again.";
  }

  return "Something went wrong while generating with AI. Please try again.";
}

/**
 * Map a Prisma / database error to a user-friendly message.
 * Prisma error codes: https://www.prisma.io/docs/orm/reference/error-reference
 */
export function dbErrorMessage(error) {
  const code = error?.code;

  switch (code) {
    case "P1001": // Can't reach database server
    case "P1002": // Timed out reaching database
      return "We couldn't reach the database (it may be waking up). Please try again in a few seconds.";
    case "P1008": // Operation timed out
      return "The database took too long to respond. Please try again.";
    case "P2025": // Record not found (also used for ownership checks)
      return "This item no longer exists or you don't have access to it.";
    case "P2002": // Unique constraint
      return "A record with these details already exists.";
    default:
      return "A database error occurred. Please try again shortly.";
  }
}

/** True when the error looks like a database/Prisma error. */
export function isDbError(error) {
  return typeof error?.code === "string" && /^P\d{4}$/.test(error.code);
}

/** True for our own auth guard errors so we can pass them through untouched. */
export function isAuthError(error) {
  const m = error?.message || "";
  return m === "Unauthorized" || m === "User not found";
}
