import { FlagRouter } from "@medusajs/utils";
export declare const featureFlagRouter: FlagRouter;
/**
 * Load feature flags from a directory and from the already loaded config under the hood
 * @param sourcePath
 */
export declare function featureFlagsLoader(sourcePath?: string): Promise<FlagRouter>;
//# sourceMappingURL=feature-flag-loader.d.ts.map