import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "no-var": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "no-unused-vars": ["off"],
      "@typescript-eslint/no-unused-vars": ["off",],
      "quotes": ["off"],
      "@typescript-eslint/quotes": ["off"],
      "@typescript-eslint/no-empty-object-type": ["off"],
      "prefer-const": ["off"],
      "react/no-unescaped-entities": ["off"],
    },
  },
];

export default eslintConfig;
