import { Constructor, InternalModuleDeclaration, LoaderOptions, Logger, MedusaContainer, ModuleExports, ModuleLoaderFunction, ModuleProviderExports, ModuleProviderLoaderFunction, ModuleResolution } from "@medusajs/types";
type ModuleResource = {
    services: Function[];
    models: Function[];
    repositories: Function[];
    loaders: ModuleLoaderFunction[] | ModuleProviderLoaderFunction[];
    moduleService: Constructor<any>;
    normalizedPath: string;
};
type MigrationFunction = (options: LoaderOptions<any>, moduleDeclaration?: InternalModuleDeclaration) => Promise<void>;
type ResolvedModule = ModuleExports & {
    discoveryPath: string;
};
type ResolvedModuleProvider = ModuleProviderExports & {
    discoveryPath: string;
};
export declare function resolveModuleExports({ resolution, }: {
    resolution: ModuleResolution;
}): Promise<ResolvedModule | ResolvedModuleProvider | {
    error: any;
}>;
export declare function loadInternalModule(args: {
    container: MedusaContainer;
    resolution: ModuleResolution;
    logger: Logger;
    migrationOnly?: boolean;
    loaderOnly?: boolean;
    loadingProviders?: boolean;
}): Promise<{
    error?: Error;
} | void>;
export declare function loadModuleMigrations(resolution: ModuleResolution, moduleExports?: ModuleExports): Promise<{
    runMigrations?: MigrationFunction;
    revertMigration?: MigrationFunction;
    generateMigration?: MigrationFunction;
}>;
export declare function loadResources({ moduleResolution, discoveryPath, logger, loadedModuleLoaders, }: {
    moduleResolution: ModuleResolution;
    discoveryPath: string;
    logger?: Logger;
    loadedModuleLoaders?: ModuleLoaderFunction[] | ModuleProviderLoaderFunction[];
}): Promise<ModuleResource>;
export {};
//# sourceMappingURL=load-internal.d.ts.map