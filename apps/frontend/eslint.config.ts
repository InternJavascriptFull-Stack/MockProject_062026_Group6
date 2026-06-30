import { baseConfig, reactConfig } from "@nursinghome/eslint-config";
import { defineConfig } from "eslint/config";

const __dirname = new URL(".", import.meta.url).pathname;

export default defineConfig([
  ...baseConfig,
  ...reactConfig,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname,
      },
    },
  },
]);
