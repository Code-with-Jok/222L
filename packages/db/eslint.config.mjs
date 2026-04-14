import { config } from "@repo/config/eslint/base";

export default [
  ...config,
  {
    ignores: ["src/generated/**"],
  },
];
