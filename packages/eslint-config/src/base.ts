import eslintJs from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";
import { importX } from "eslint-plugin-import-x";
import globals from "globals";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

export default defineConfig([
  globalIgnores(["node_modules/**", "dist/**"]),

  {
    files: ["**/*.ts", "**/*.tsx", "**/*.mts", "**/*.js", "**/*.mjs"],
    extends: [
      eslintJs.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      importX.flatConfigs.recommended,
      importX.flatConfigs.typescript,
    ],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: {
          allowDefaultProject: ["eslint.config.ts", "eslint.config.js"],
        },
        tsconfigRootDir: process.cwd(),
      },
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    settings: {
      "import-x/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: [
            "tsconfig.json",
            "apps/*/tsconfig.json",
            "packages/*/tsconfig.json",
          ],
        },
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          checksVoidReturn: {
            attributes: false,
          },
        },
      ],
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "interface",
          format: ["PascalCase"],
          custom: {
            regex: "^I[A-Z]",
            match: false,
          },
        },
      ],
      "import-x/no-cycle": ["error", { maxDepth: 10, ignoreExternal: true }],
      "import-x/no-unresolved": "error",
    },
  },

  // {
  //   files: ["**/*.test.ts", "**/*.test.tsx", "**/tests/**"],
  //   settings: {
  //     "import-x/core-modules": ["bun:test"],
  //   },
  // },

  // ...architecture,

  {
    files: [
      "**/*.config.ts",
      "**/*.config.js",
      "**/eslint.config.ts",
      "**/eslint.config.js",
      "**/vite.config.ts",
    ],
    ...tseslint.configs.disableTypeChecked,
  },
  eslintPluginPrettierRecommended,
]);
