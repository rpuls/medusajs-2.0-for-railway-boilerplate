/**
 * Storefront unit-test runner. Mirrors the backend Jest setup
 * (backend/jest.config.cjs) but accepts spec files anywhere under src,
 * since the storefront convention is to colocate `*.spec.ts` next to
 * the source file rather than in a `__tests__/` subfolder.
 *
 * Run with `pnpm test` (after `pnpm install` to pick up jest + @swc/jest).
 *
 * @type {import('jest').Config}
 */
module.exports = {
  rootDir: ".",
  roots: ["<rootDir>/src"],
  testEnvironment: "node",
  testMatch: [
    "<rootDir>/src/**/*.spec.ts",
    "<rootDir>/src/**/*.spec.tsx",
  ],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  transform: {
    "^.+\\.(t|j)sx?$": [
      "@swc/jest",
      {
        jsc: {
          target: "es2022",
          parser: {
            syntax: "typescript",
            tsx: true,
            decorators: false,
          },
          transform: {
            react: {
              runtime: "automatic",
            },
          },
        },
        module: {
          type: "commonjs",
        },
      },
    ],
  },
  // Mirrors `paths` in tsconfig.json so `@modules/...`, `@lib/...` resolve.
  moduleNameMapper: {
    "^@modules/(.*)$": "<rootDir>/src/modules/$1",
    "^@lib/(.*)$": "<rootDir>/src/lib/$1",
    "^@pages/(.*)$": "<rootDir>/src/app/$1",
  },
  testPathIgnorePatterns: ["/node_modules/", "/.next/", "/e2e/"],
}
