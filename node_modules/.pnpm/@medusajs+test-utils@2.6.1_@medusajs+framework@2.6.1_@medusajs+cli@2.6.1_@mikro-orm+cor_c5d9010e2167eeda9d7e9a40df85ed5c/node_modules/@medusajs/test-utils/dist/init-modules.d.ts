import { ExternalModuleDeclaration, InternalModuleDeclaration, ModuleJoinerConfig } from "@medusajs/framework/types";
export interface InitModulesOptions {
    injectedDependencies?: Record<string, unknown>;
    databaseConfig: {
        clientUrl: string;
        schema?: string;
    };
    modulesConfig: {
        [key: string]: string | boolean | Partial<InternalModuleDeclaration | ExternalModuleDeclaration>;
    };
    joinerConfig?: ModuleJoinerConfig[];
    preventConnectionDestroyWarning?: boolean;
}
export declare function initModules({ injectedDependencies, databaseConfig, modulesConfig, joinerConfig, preventConnectionDestroyWarning, }: InitModulesOptions): Promise<{
    medusaApp: any;
    shutdown: () => Promise<void>;
}>;
//# sourceMappingURL=init-modules.d.ts.map