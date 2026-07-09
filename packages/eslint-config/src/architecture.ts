import { defineConfig } from "eslint/config";

export default defineConfig([
  // FEATURE BOUNDARY ENFORCEMENT
  {
    files: [
      "apps/**/src/features/**/*.ts",
      "apps/**/src/features/**/*.tsx",
      "src/features/**/*.ts",
      "src/features/**/*.tsx",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              // 1. Enforce encapsulation: import only through the public interface (index.ts).
              //    Do not directly access child files inside another feature.
              group: [
                "@/features/*/*",
                "!@/features/*/index",
                "!@/features/*/index.ts",
                "!@/features/*/index.tsx",
                "!@/features/*/hooks",
                "!@/features/*/hooks/**",
                "!@/features/*/components",
                "!@/features/*/components/**",
                "!@/features/*/types",
                "!@/features/*/types/**",
                "!@/features/*/services",
                "!@/features/*/services/**",
                "!@/features/*/stores",
                "!@/features/*/stores/**",
                "!@/features/*/utils",
                "!@/features/*/utils/**",
                "!@/features/*/actions",
                "!@/features/*/actions/**",
                "@/features/*/*/*",
                "!@/features/*/*/index",
                "!@/features/*/*/index.ts",
                "!@/features/*/*/index.tsx",
              ],
              message:
                "Private internal access! Import is only allowed from public interfaces (index.ts), sub-barrels (hooks, components, etc.), or safe deep imports. Direct access to internal files is forbidden.",
            },
            {
              // 2. Prevent features from importing back from the App Router layer (UI Layer).
              //    Keep the UI-agnostic dependency rule.
              group: ["@/app/**", "@/app/*"],
              message:
                "Features MUST NOT import from the Next.js App layer (app/). The App layer can call features, but not vice versa.",
            },
            {
              // 3. Prevent direct imports from shared/services inside features; use the public index instead.
              group: ["@/shared/services/*", "!@/shared/services/index"],
              message:
                "Only import from @/shared/services (public interface), do not import internal files directly.",
            },
          ],
        },
      ],

      // Strengthen anti-circular dependency checks with import-x/no-cycle.
      "import-x/no-cycle": [
        "error",
        {
          maxDepth: 4,
          ignoreExternal: true,
          allowUnsafeDynamicCyclicDependency: false,
        },
      ],

      // Prevent a file from importing itself through any path (./index, alias, and so on).
      "import-x/no-self-import": "error",
    },
  },

  // APP LAYER FEATURE GATEKEEPING
  {
    files: [
      "apps/**/app/**/*.ts",
      "apps/**/app/**/*.tsx",
      "app/**/*.ts",
      "app/**/*.tsx",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              // Allow imports from feature/sub-feature public barrels or safe deep imports to avoid server/client leakage.
              group: [
                "@/features/*/*/*",
                "!@/features/*/*/index",
                "!@/features/*/*/index.ts",
                "!@/features/*/*/index.tsx",
                "!@/features/*/hooks/**",
                "!@/features/*/components/**",
                "!@/features/*/types/**",
                "!@/features/*/services/**",
                "!@/features/*/stores/**",
                "!@/features/*/utils/**",
                "!@/features/*/actions/**",
              ],
              message:
                "The App layer is only allowed to import from public barrels or safe deep imports (components, hooks, etc.) of a feature. Importing other internal files is forbidden.",
            },
          ],
        },
      ],
    },
  },

  // FEATURE BARREL SELF-IMPORT GUARD
  {
    files: [
      "apps/**/src/features/**/index.ts",
      "apps/**/src/features/**/index.tsx",
      "src/features/**/index.ts",
      "src/features/**/index.tsx",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["./index", "./index.ts", "./index.tsx"],
              message: "A barrel file must not import itself (./index).",
            },
          ],
        },
      ],
    },
  },

  // SHARED LAYER PROTECTION
  {
    files: [
      "apps/**/src/shared/**/*.ts",
      "apps/**/src/shared/**/*.tsx",
      "src/shared/**/*.ts",
      "src/shared/**/*.tsx",
    ],
    rules: {
      "no-restricted-imports": [
        "warn",
        {
          patterns: [
            {
              group: ["@/features/**"],
              message:
                "The Shared layer should not import from Features. The Shared layer must remain independent.",
            },
          ],
        },
      ],
    },
  },
]);
