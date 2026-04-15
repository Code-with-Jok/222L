import { config as baseConfig } from "@repo/config/eslint/base";

export default [
  ...baseConfig,
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parserOptions: {
        projectService: false
      }
    }
  }
];
