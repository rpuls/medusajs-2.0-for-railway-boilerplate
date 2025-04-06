module.exports = {
  extends: [
    "next/core-web-vitals",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  root: true,
  rules: {
    // Disable rules that might be causing problems
    "@typescript-eslint/no-explicit-any": "off", // Allow 'any' type
    "@typescript-eslint/no-unused-vars": ["warn", {
      "argsIgnorePattern": "^_",
      "varsIgnorePattern": "^_"
    }], // Only warn for unused variables
    "no-console": "off", // Allow console.log
    "@typescript-eslint/ban-ts-comment": "off", // Allow @ts-ignore comments
    "@typescript-eslint/no-non-null-assertion": "off", // Allow non-null assertions

    // Add some helpful rules
    "eqeqeq": ["error", "always"], // Require === and !==
    "no-var": "error", // Disallow var
    "prefer-const": "warn", // Prefer const over let
    "no-duplicate-imports": "error", // No duplicate imports
  },
  ignorePatterns: [
    "node_modules/",
    ".next/",
    "out/",
    "public/",
    "**/*.d.ts",
  ],
  overrides: [
    {
      // Specific rules for Next.js pages and API routes
      files: ["src/pages/**/*.tsx", "src/pages/api/**/*.ts", "src/app/**/*.tsx", "src/app/api/**/*.ts"],
      rules: {
        "import/no-anonymous-default-export": "off",
      },
    },
  ],
};