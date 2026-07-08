import { backendConfig } from "@nursinghome/eslint-config";
import { defineConfig } from "eslint/config";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig([
  ...backendConfig,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname,
      },
    },
  },
]);
