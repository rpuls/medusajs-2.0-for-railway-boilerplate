import { InternalModuleDeclaration, LinkModuleDefinition, LoadedModule, MedusaContainer, ModuleBootstrapDeclaration, ModuleDefinition, ModuleExports, ModuleJoinerConfig, ModuleResolution } from "@medusajs/types";
declare global {
    interface MedusaModule {
        getLoadedModules(aliases?: Map<string, string>): {
            [key: string]: LoadedModule;
        }[];
        getModuleInstance(moduleKey: string, alias?: string): LoadedModule;
    }
}
export type MigrationOptions = {
    moduleKey: string;
    modulePath: string;
    container?: MedusaContainer;
    options?: Record<string, any>;
    moduleExports?: ModuleExports;
};
export type ModuleBootstrapOptions = {
    moduleKey: string;
    defaultPath: string;
    declaration?: ModuleBootstrapDeclaration;
    moduleExports?: ModuleExports;
    sharedContainer?: MedusaContainer;
    moduleDefinition?: ModuleDefinition;
    injectedDependencies?: Record<string, any>;
    /**
     * In this mode, all instances are partially loaded, meaning that the module will not be fully loaded and the services will not be available.
     * Don't forget to clear the instances (MedusaModule.clearInstances()) after the migration are done.
     */
    migrationOnly?: boolean;
    /**
     * Forces the modules bootstrapper to only run the modules loaders and return prematurely. This
     * is meant for modules that have data loader. In a test env, in order to clear all data
     * and load them back, we need to run those loader again
     */
    loaderOnly?: boolean;
    workerMode?: "shared" | "worker" | "server";
};
export type LinkModuleBootstrapOptions = {
    definition: LinkModuleDefinition;
    declaration?: InternalModuleDeclaration;
    moduleExports?: ModuleExports;
    injectedDependencies?: Record<string, any>;
};
export type RegisterModuleJoinerConfig = ModuleJoinerConfig | ((modules: ModuleJoinerConfig[]) => ModuleJoinerConfig);
declare class MedusaModule {
    private static instances_;
    private static modules_;
    private static customLinks_;
    private static loading_;
    private static joinerConfig_;
    private static moduleResolutions_;
    static getLoadedModules(aliases?: Map<string, string>): {
        [key: string]: LoadedModule;
    }[];
    static onApplicationStart(onApplicationStartCb?: () => void): void;
    static onApplicationShutdown(): Promise<void>;
    static onApplicationPrepareShutdown(): Promise<void>;
    static clearInstances(): void;
    static isInstalled(moduleKey: string, alias?: string): boolean;
    static getJoinerConfig(moduleKey: string): ModuleJoinerConfig;
    static getAllJoinerConfigs(): ModuleJoinerConfig[];
    static getModuleResolutions(moduleKey: string): ModuleResolution;
    static getAllModuleResolutions(): ModuleResolution[];
    static setModuleResolution(moduleKey: string, resolution: ModuleResolution): ModuleResolution;
    static setJoinerConfig(moduleKey: string, config: ModuleJoinerConfig): ModuleJoinerConfig;
    static setCustomLink(config: RegisterModuleJoinerConfig): void;
    static getCustomLinks(): RegisterModuleJoinerConfig[];
    static getModuleInstance(moduleKey: string, alias?: string): any | undefined;
    private static registerModule;
    /**
     * Load all modules and resolve them once they are loaded
     * @param modulesOptions
     * @param migrationOnly
     * @param loaderOnly
     * @param workerMode
     */
    static bootstrapAll(modulesOptions: Omit<ModuleBootstrapOptions, "migrationOnly" | "loaderOnly" | "workerMode">[], { migrationOnly, loaderOnly, workerMode, }: {
        migrationOnly?: boolean;
        loaderOnly?: boolean;
        workerMode?: ModuleBootstrapOptions["workerMode"];
    }): Promise<{
        [key: string]: any;
    }[]>;
    /**
     * Load a single module and resolve it once it is loaded
     * @param moduleKey
     * @param defaultPath
     * @param declaration
     * @param moduleExports
     * @param sharedContainer
     * @param moduleDefinition
     * @param injectedDependencies
     * @param migrationOnly
     * @param loaderOnly
     * @param workerMode
     */
    static bootstrap<T>({ moduleKey, defaultPath, declaration, moduleExports, sharedContainer, moduleDefinition, injectedDependencies, migrationOnly, loaderOnly, workerMode, }: ModuleBootstrapOptions): Promise<{
        [key: string]: T;
    }>;
    /**
     * Load all modules and then resolve them once they are loaded
     *
     * @param modulesOptions
     * @param migrationOnly
     * @param loaderOnly
     * @param workerMode
     * @protected
     */
    protected static bootstrap_<T>(modulesOptions: Omit<ModuleBootstrapOptions, "migrationOnly" | "loaderOnly" | "workerMode">[], { migrationOnly, loaderOnly, workerMode, }: {
        migrationOnly?: boolean;
        loaderOnly?: boolean;
        workerMode?: "shared" | "worker" | "server";
    }): Promise<{
        [key: string]: T;
    }[]>;
    /**
     * Resolve all the modules once they all have been loaded through the bootstrap
     * and store their references in the instances_ map and return them
     *
     * @param hashKey
     * @param modDeclaration
     * @param moduleResolutions
     * @param container
     * @private
     */
    private static resolveLoadedModule;
    static bootstrapLink({ definition, declaration, moduleExports, injectedDependencies, }: LinkModuleBootstrapOptions): Promise<{
        [key: string]: unknown;
    }>;
    static migrateGenerate({ options, container, moduleExports, moduleKey, modulePath, }: MigrationOptions): Promise<void>;
    static migrateUp({ options, container, moduleExports, moduleKey, modulePath, }: MigrationOptions): Promise<void>;
    static migrateDown({ options, container, moduleExports, moduleKey, modulePath, }: MigrationOptions): Promise<void>;
}
declare const GlobalMedusaModule: typeof MedusaModule;
export { GlobalMedusaModule as MedusaModule };
//# sourceMappingURL=medusa-module.d.ts.map