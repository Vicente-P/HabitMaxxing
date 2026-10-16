import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Auto-generated files — never lint these:
    "src/generated/**",
    // Design mockup reference (Claude Design export, browser-run Babel); not application code.
    "docs/design/mockup/**",
  ]),
]);

// Design-token guard (docs/specs/DESIGN_SYSTEM.md): UI classes must use --hm-* tokens only.
const legacyColorPattern = "(^|[\\s:!-])(zinc|gray|slate|neutral|stone|brand)-\\d|(^|[\\s:!-])(light|dark)-(bg|text|border)|(^|[\\s:!-])(white|black)(\\s|-|$)|(^|\\s)(dark|light):|#[0-9a-fA-F]{3,8}\\b";
const designTokenMessage = "Usa tokens --hm-* del mockup (docs/design/mockup); no colores hex ni colores por defecto de Tailwind ni variantes dark:/light:.";

const designTokenGuard = {
  files: ["src/**/*.{ts,tsx}"],
  rules: {
    "no-restricted-syntax": [
      "error",
      { selector: `Literal[value=/${legacyColorPattern}/]`, message: designTokenMessage },
      { selector: `TemplateElement[value.raw=/${legacyColorPattern}/]`, message: designTokenMessage },
    ],
  },
};

export default [...eslintConfig, designTokenGuard];
