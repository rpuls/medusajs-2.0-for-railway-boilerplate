import { LoaderOptions, ModulesSdkTypes } from "@medusajs/types";
/**
 * Utility function to build a migration script that will run the migrations.
 * Only used in mikro orm based modules.
 * @param moduleName
 * @param pathToMigrations
 */
export declare function buildMigrationScript({ moduleName, pathToMigrations }: {
    moduleName: any;
    pathToMigrations: any;
}): ({ options, logger, }?: Pick<LoaderOptions<ModulesSdkTypes.ModuleServiceInitializeOptions>, "options" | "logger">) => Promise<void>;
//# sourceMappingURL=migration-up.d.ts.map