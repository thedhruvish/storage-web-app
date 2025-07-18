// @ts-check

import { tanstackConfig } from "@tanstack/eslint-config";
import stylistic from "@stylistic/eslint-plugin";

export default [
  ...tanstackConfig,
  {
    ignores: ["src/components/ui/**"],
  },
  {
    plugins: {
      "@stylistic": stylistic,
    },
    rules: {
      "import/no-cycle": "warn", // you can still use the rule if the plugin is already declared by TanStack
    },
    settings: {
      "import/resolver": {
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      },
    },
  },
];
