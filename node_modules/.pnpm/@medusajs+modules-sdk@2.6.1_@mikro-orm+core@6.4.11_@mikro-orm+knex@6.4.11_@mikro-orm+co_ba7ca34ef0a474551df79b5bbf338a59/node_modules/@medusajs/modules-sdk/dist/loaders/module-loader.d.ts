import { Logger, MedusaContainer, ModuleResolution } from "@medusajs/types";
export declare const moduleLoader: ({ container, moduleResolutions, logger, migrationOnly, loaderOnly, }: {
    container: MedusaContainer;
    moduleResolutions: Record<string, ModuleResolution>;
    logger: Logger;
    migrationOnly?: boolean;
    loaderOnly?: boolean;
}) => Promise<void>;
//# sourceMappingURL=module-loader.d.ts.map