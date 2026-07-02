// Template registry — single source of truth for the 5 resume templates.
// Add a template here and it automatically appears in the selector + preview.

import ClassicFaang from "./ClassicFaang";
import ModernProfessional from "./ModernProfessional";
import MinimalAts from "./MinimalAts";
import PremiumTech from "./PremiumTech";
import StudentFresher from "./StudentFresher";

export const RESUME_TEMPLATES = [
  {
    id: "classic-faang",
    name: "Classic FAANG",
    description: "One-column, ATS-friendly, black & white. Google/Meta/Amazon style.",
    accent: "#111827",
    tags: ["ATS", "Minimal"],
    Component: ClassicFaang,
  },
  {
    id: "modern-professional",
    name: "Modern Professional",
    description: "Two-column with an indigo skills sidebar. For SWE / full-stack.",
    accent: "#4f46e5",
    tags: ["Two-column", "Accent"],
    Component: ModernProfessional,
  },
  {
    id: "minimal-ats",
    name: "Minimal ATS",
    description: "Pure parser-first resume. Zero styling, perfect spacing.",
    accent: "#000000",
    tags: ["ATS-first"],
    Component: MinimalAts,
  },
  {
    id: "premium-tech",
    name: "Premium Tech",
    description: "Elegant serif + subtle icons. Stripe / Airbnb / OpenAI feel.",
    accent: "#7c3aed",
    tags: ["Premium", "Icons"],
    Component: PremiumTech,
  },
  {
    id: "student-fresher",
    name: "Student / Fresher",
    description: "Education-first, internship-ready, friendly yet professional.",
    accent: "#c026d3",
    tags: ["Students", "Freshers"],
    Component: StudentFresher,
  },
];

export const DEFAULT_TEMPLATE_ID = RESUME_TEMPLATES[0].id;

export function getTemplateById(id) {
  return (
    RESUME_TEMPLATES.find((t) => t.id === id) || RESUME_TEMPLATES[0]
  );
}
