import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Single, ESLint-9-native flat config (the legacy .eslintrc.json was removed
// to end the dual-config conflict). Run via `npm run lint` (`eslint .`), NOT
// `next lint`: the latter serializes this config and throws on the parser's
// `parse` function, and `next lint` is deprecated from Next 15.5+.
const eslintConfig = [
  {
    ignores: [".next/**", "node_modules/**", "public/**", "next-env.d.ts"],
  },
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      // Preserve the project's prior rule (kept non-blocking as a warning).
      "no-unused-vars": "warn",
    },
  },
];

export default eslintConfig;
