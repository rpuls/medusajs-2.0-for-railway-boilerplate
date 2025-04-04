import { RemoteFetchDataCallback } from "@medusajs/orchestration";
import { ExternalModuleDeclaration, ILinkMigrationsPlanner, InternalModuleDeclaration, LoadedModule, MedusaContainer, ModuleJoinerConfig, ModuleServiceInitializeOptions, RemoteQueryFunction } from "@medusajs/types";
import { GraphQLUtils, Modules } from "@medusajs/utils";
import { Link } from "./link";
import { RegisterModuleJoinerConfig } from "./medusa-module";
export type RunMigrationFn = () => Promise<void>;
export type RevertMigrationFn = (moduleNames: string[]) => Promise<void>;
export type GenerateMigrations = (moduleNames: string[]) => Promise<void>;
export type GetLinkExecutionPlanner = () => ILinkMigrationsPlanner;
export type MedusaModuleConfig = {
    [key: string | Modules]: string | boolean | Partial<InternalModuleDeclaration | ExternalModuleDeclaration>;
};
export type SharedResources = {
    database?: ModuleServiceInitializeOptions["database"] & {
        /**
         * {
         *   name?: string
         *   afterCreate?: Function
         *   min?: number
         *   max?: number
         *   refreshIdle?: boolean
         *   idleTimeoutMillis?: number
         *   reapIntervalMillis?: number
         *   returnToHead?: boolean
         *   priorityRange?: number
         *   log?: (message: string, logLevel: string) => void
         * }
         */
        pool?: Record<string, unknown>;
    };
};
export declare function loadModules(args: {
    modulesConfig: MedusaModuleConfig;
    sharedContainer: MedusaContainer;
    sharedResourcesConfig?: SharedResources;
    migrationOnly?: boolean;
    loaderOnly?: boolean;
    workerMode?: "shared" | "worker" | "server";
}): Promise<any>;
export type MedusaAppOutput = {
    modules: Record<string, LoadedModule | LoadedModule[]>;
    link: Link | undefined;
    query: RemoteQueryFunction;
    entitiesMap?: Record<string, any>;
    gqlSchema?: GraphQLUtils.GraphQLSchema;
    notFound?: Record<string, Record<string, string>>;
    runMigrations: RunMigrationFn;
    revertMigrations: RevertMigrationFn;
    generateMigrations: GenerateMigrations;
    linkMigrationExecutionPlanner: GetLinkExecutionPlanner;
    onApplicationShutdown: () => Promise<void>;
    onApplicationPrepareShutdown: () => Promise<void>;
    onApplicationStart: () => Promise<void>;
    sharedContainer?: MedusaContainer;
};
export type MedusaAppOptions = {
    workerMode?: "shared" | "worker" | "server";
    sharedContainer?: MedusaContainer;
    sharedResourcesConfig?: SharedResources;
    loadedModules?: LoadedModule[];
    servicesConfig?: ModuleJoinerConfig[];
    modulesConfigPath?: string;
    modulesConfigFileName?: string;
    modulesConfig?: MedusaModuleConfig;
    linkModules?: RegisterModuleJoinerConfig | RegisterModuleJoinerConfig[];
    remoteFetchData?: RemoteFetchDataCallback;
    injectedDependencies?: any;
    onApplicationStartCb?: () => void;
    /**
     * Forces the modules bootstrapper to only run the modules loaders and return prematurely
     */
    loaderOnly?: boolean;
};
export declare function MedusaApp(options?: MedusaAppOptions): Promise<MedusaAppOutput>;
export declare function MedusaAppMigrateUp(options?: MedusaAppOptions): Promise<void>;
export declare function MedusaAppMigrateDown(moduleNames: string[], options?: MedusaAppOptions): Promise<void>;
export declare function MedusaAppMigrateGenerate(moduleNames: string[], options?: MedusaAppOptions): Promise<void>;
export declare function MedusaAppGetLinksExecutionPlanner(options?: MedusaAppOptions): Promise<ILinkMigrationsPlanner>;
//# sourceMappingURL=medusa-app.d.ts.map