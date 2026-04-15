import { config } from "@repo/config/eslint/base";

export default [
  // Must be a standalone object to apply globally in flat config
  {
    ignores: ["src/generated/**", "prisma/seed.ts", "test-prisma.ts"],
  },
  ...config,
  {
    languageOptions: {
      globals: {
        process: "readonly",
        console: "readonly",
      },
    },
  },
];
