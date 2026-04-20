import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,

  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "logs/**",
    "data/**",
  ]),

  // ── Module Boundary Enforcement ──
  // Prevents importing from another module's internal files (domain/, data/).
  // Only api/index.js is the public surface of each module.
  {
    rules: {
      "no-restricted-imports": ["error", {
        patterns: [
          {
            group: [
              "@/src/modules/*/domain/*",
              "@/src/modules/*/domain",
              "*/modules/*/domain/*",
              "*/modules/*/domain",
            ],
            message: "⛔ Import only from module's api/ folder. Direct domain/ access breaks module isolation.",
          },
          {
            group: [
              "@/src/modules/*/data/*",
              "@/src/modules/*/data",
              "*/modules/*/data/*",
              "*/modules/*/data",
            ],
            message: "⛔ Import only from module's api/ folder. Direct data/ access breaks module isolation.",
          },
        ],
      }],
    },
  },

  // Allow modules to import their own internals (override for module-internal files)
  {
    files: ["src/modules/*/domain/**", "src/modules/*/data/**", "src/modules/*/api/**"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
]);

export default eslintConfig;
