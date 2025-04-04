/**
 * Custom wrapper on top of MikroORM CLI to override the issue
 * they have when importing TypeScript files.
 *
 * They have hardcoded the module system of TypeScript to CommonJS
 * and that makes it impossible to use any other module system
 * like Node16 or NodeNext and so on.
 *
 * With this wrapper, we monkey patch the code responsible for register
 * ts-node and then boot their CLI. Since, the code footprint is
 * small, we should be okay with managing this wrapper.
 */
export {};
//# sourceMappingURL=bin.d.ts.map