import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
    ".turbo/**",
    "dist/**",
    "public/**",
  ]),
  {
    rules: {
      // Airbnb-style rules adapted for ESLint 9
      // React Rules
      "react/react-in-jsx-scope": "off", // Not needed in Next.js
      "react/prop-types": "off", // We use TypeScript
      "react/display-name": "off",
      "react/no-unescaped-entities": "warn",
      "react/no-unknown-property": ["error", { ignore: ["jsx"] }],

      // React Hooks Rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/purity": "off", // Disabled - too strict for utility functions

      // Import Rules (Airbnb-style)
      "import/prefer-default-export": "off",

      // Next.js specific
      "@next/next/no-html-link-for-pages": "off",

      // TypeScript Rules (Airbnb-style)
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-non-null-assertion": "warn",

      // General JavaScript/TypeScript (Airbnb-style)
      "no-console": process.env.NODE_ENV === "production" ? "error" : "warn",
      "no-debugger": "error",
      "no-alert": "warn",
      "prefer-const": "error",
      "no-var": "error",
      "object-shorthand": "error",
      "prefer-template": "error",
      "template-curly-spacing": "error",
      "arrow-spacing": "error",
      "prefer-arrow-callback": "error",

      // Code quality
      "no-unused-vars": "off", // Use TypeScript version instead
      "consistent-return": "off",
      "no-else-return": "warn",
      eqeqeq: "off", // Disabled - allows == for nullable checks, reduces false positives
      "no-return-assign": "error",
      "no-useless-return": "error",

      // Best practices (Airbnb-style)
      "array-callback-return": "warn",
      "no-iterator": "error",
      "no-new-wrappers": "error",
      "no-throw-literal": "error",
      radix: "error",
    },
  },
]);

export default eslintConfig;
