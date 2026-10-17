import { existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
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

// Architecture boundaries (docs/architecture/decisions/ADR-05-estructura-por-feature.md).
// Flat config keeps only the last matching `no-restricted-imports`, so each feature/layer gets one
// object that already includes the cross-feature bans.
const featuresDir = fileURLToPath(new URL("./src/features", import.meta.url));
const features = existsSync(featuresDir)
  ? readdirSync(featuresDir, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name)
  : [];

const prismaBan = {
  group: ["@/lib/prisma", "@/generated/*", "@prisma/*"],
  message: "Prisma solo se importa desde infrastructure/ o desde la composición en src/app (ADR-05).",
};
const frameworkBan = {
  group: ["next", "next/*", "@/app/**"],
  message: "domain/ y application/ no dependen de Next.js ni de src/app (ADR-05).",
};
const infrastructureBan = {
  group: ["**/infrastructure", "**/infrastructure/**"],
  message: "domain/ y application/ dependen de puertos, no de infrastructure/ (ADR-05).",
};
const applicationBan = {
  group: ["**/application", "**/application/**"],
  message: "domain/ no depende de application/ (ADR-05).",
};
const crossFeatureBans = (feature) =>
  features
    .filter((other) => other !== feature)
    .map((other) => ({
      group: [`@/features/${other}/**`],
      message: `Una feature solo usa la API pública (index.ts) de otra: importa desde @/features/${other} (ADR-05).`,
    }));

const boundaryGuards = features.flatMap((feature) => [
  {
    files: [`src/features/${feature}/domain/**/*.{ts,tsx}`],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [prismaBan, frameworkBan, infrastructureBan, applicationBan, ...crossFeatureBans(feature)] },
      ],
    },
  },
  {
    files: [`src/features/${feature}/application/**/*.{ts,tsx}`],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [prismaBan, frameworkBan, infrastructureBan, ...crossFeatureBans(feature)] },
      ],
    },
  },
  {
    files: [`src/features/${feature}/infrastructure/**/*.{ts,tsx}`, `src/features/${feature}/ui/**/*.{ts,tsx}`],
    rules: {
      "no-restricted-imports": ["error", { patterns: crossFeatureBans(feature) }],
    },
  },
]);

export default [...eslintConfig, designTokenGuard, ...boundaryGuards];
