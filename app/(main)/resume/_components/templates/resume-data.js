// Shared data layer for all resume templates.
// Every template renders from this single normalized shape — no duplicated
// business logic. Input is the same react-hook-form `formValues` used by the
// existing builder plus the Clerk user's full name.

/**
 * Normalize raw form values into a clean, template-ready object.
 * @param {object} formValues - react-hook-form values from the builder
 * @param {string} [fullName] - Clerk user's full name
 */
export function buildResumeData(formValues = {}, fullName = "") {
  const {
    contactInfo = {},
    summary = "",
    skills = "",
    experience = [],
    education = [],
    projects = [],
  } = formValues;

  return {
    name: (fullName || "").trim() || "Your Name",
    contact: {
      email: contactInfo.email || "",
      mobile: contactInfo.mobile || "",
      linkedin: contactInfo.linkedin || "",
      twitter: contactInfo.twitter || "",
      github: contactInfo.github || "",
      portfolio: contactInfo.portfolio || "",
    },
    summary: (summary || "").trim(),
    skills: parseSkills(skills),
    experience: normalizeEntries(experience),
    education: normalizeEntries(education),
    projects: normalizeEntries(projects),
  };
}

function normalizeEntries(entries) {
  if (!Array.isArray(entries)) return [];
  return entries
    .filter(Boolean)
    .map((e) => ({
      title: e.title || "",
      organization: e.organization || "",
      dateRange: formatDateRange(e),
      bullets: toBullets(e.description),
    }));
}

/** Turn a stored entry's dates into "Mon YYYY - Mon YYYY" / "- Present". */
export function formatDateRange(entry = {}) {
  const { startDate, endDate, current } = entry;
  if (!startDate && !endDate) return "";
  if (current) return `${startDate} - Present`;
  if (startDate && endDate) return `${startDate} - ${endDate}`;
  return startDate || endDate || "";
}

/**
 * Split a description into bullet lines. Handles common markdown/plain
 * conventions (-, *, •). A single unbroken line becomes one "bullet"
 * that templates may render as a paragraph.
 */
export function toBullets(description = "") {
  if (!description) return [];
  return description
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*[-*•]\s?/, "").trim())
    .filter(Boolean);
}

/** Split a skills string on commas / newlines / pipes into unique chips. */
export function parseSkills(skills = "") {
  if (!skills) return [];
  const seen = new Set();
  return skills
    .split(/[\n,|]+/)
    .map((s) => s.replace(/^\s*[-*•]\s?/, "").trim())
    .filter((s) => {
      if (!s) return false;
      const key = s.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

/** Human-friendly label for a profile URL (strips protocol/www/trailing slash). */
export function linkLabel(url = "") {
  if (!url) return "";
  return url
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/$/, "");
}

/** Ensure a URL is absolute so it works as an <a href> and in the PDF. */
export function ensureHttp(url = "") {
  const v = url.trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  if (/^www\./i.test(v)) return `https://${v}`;
  return `https://${v}`;
}

/** Build a clickable href for a contact field. */
export function contactHref(kind, value = "") {
  const v = value.trim();
  if (!v) return "";
  if (kind === "email") return `mailto:${v}`;
  if (kind === "mobile") return `tel:${v.replace(/[^\d+]/g, "")}`;
  return ensureHttp(v);
}

/**
 * Ordered, display-ready contact entries (only the ones that exist).
 * Each item: { kind, label, href } — templates render label inside <a href>.
 */
export function getContactList(data) {
  const c = (data && data.contact) || {};
  const items = [
    { kind: "email", raw: c.email, label: c.email },
    { kind: "mobile", raw: c.mobile, label: c.mobile },
    { kind: "linkedin", raw: c.linkedin, label: linkLabel(c.linkedin) },
    { kind: "github", raw: c.github, label: linkLabel(c.github) },
    { kind: "portfolio", raw: c.portfolio, label: linkLabel(c.portfolio) },
    { kind: "twitter", raw: c.twitter, label: linkLabel(c.twitter) },
  ];
  return items
    .filter((i) => i.raw && i.raw.trim())
    .map((i) => ({ kind: i.kind, label: i.label, href: contactHref(i.kind, i.raw) }));
}

/**
 * Tokenize free text into plain-text and link segments so templates can render
 * markdown links `[label](url)` and bare URLs as real, clickable <a> tags.
 * Returns an array of { type: "text", value } | { type: "link", label, href }.
 */
export function parseInlineLinks(text = "") {
  if (!text) return [];
  const RE =
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s)]+|www\.[^\s)]+)/g;
  const out = [];
  let last = 0;
  let m;
  while ((m = RE.exec(text)) !== null) {
    if (m.index > last) out.push({ type: "text", value: text.slice(last, m.index) });
    if (m[1] && m[2]) {
      out.push({ type: "link", label: m[1], href: ensureHttp(m[2]) });
    } else if (m[3]) {
      out.push({ type: "link", label: linkLabel(m[3]), href: ensureHttp(m[3]) });
    }
    last = RE.lastIndex;
  }
  if (last < text.length) out.push({ type: "text", value: text.slice(last) });
  return out;
}

/** True when the resume has no meaningful content yet (for empty states). */
export function isResumeEmpty(data) {
  if (!data) return true;
  return (
    !data.summary &&
    data.skills.length === 0 &&
    data.experience.length === 0 &&
    data.education.length === 0 &&
    data.projects.length === 0
  );
}
