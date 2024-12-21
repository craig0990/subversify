// @ts-check
import eslint from '@eslint/js'
import tseslint, { configs as tsconfig } from 'typescript-eslint'
import eslintPluginImportX from 'eslint-plugin-import-x'
import markdown from "@eslint/markdown";

export default tseslint.config([
  eslint.configs.recommended,
  // @TODO enable type checked for ts, non-type checked for md
  tsconfig.recommended,
  eslintPluginImportX.flatConfigs.recommended,
  eslintPluginImportX.flatConfigs.typescript,
  {
    files: ["**/*.md"],
    plugins: { markdown },
    processor: "markdown/markdown",
  },
  {
    files: ['**/*.ts'],
    ignores: ['**/*.md/*.ts'],
    rules: {
      "import-x/named": "error"
    },
  },
  {
    files: ['**/*.md/*.ts'],
    languageOptions: {
      globals: {
        console: "readonly",
      },
    },
    rules: {
      ...eslint.configs.recommended.rules,
      ...eslintPluginImportX.flatConfigs.recommended.rules,
      ...eslintPluginImportX.flatConfigs.typescript.rules,
      "import-x/named": "error",
      "import-x/no-unresolved": ["error", {
        "ignore": ['^(\\.)?\\.\\/.*$']
      }]
    },
  },
]);