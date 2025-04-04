import { MedusaAppOutput, RegisterModuleJoinerConfig } from "@medusajs/modules-sdk";
import { CommonTypes, ILinkMigrationsPlanner, InternalModuleDeclaration, ModuleServiceInitializeOptions } from "@medusajs/types";
import { MedusaContainer } from "./container";
import type { Knex } from "@mikro-orm/knex";
export declare class MedusaAppLoader {
    #private;
    constructor({ container, customLinksModules, }?: {
        container?: MedusaContainer;
        customLinksModules?: RegisterModuleJoinerConfig | RegisterModuleJoinerConfig[];
    });
    protected mergeDefaultModules(modulesConfig: CommonTypes.ConfigModule["modules"]): {
        [x: string]: boolean | Partial<InternalModuleDeclaration | import("@medusajs/types").ExternalModuleDeclaration>;
    };
    protected prepareSharedResourcesAndDeps(): {
        sharedResourcesConfig: ModuleServiceInitializeOptions;
        injectedDependencies: {
            __pg_connection__: Knex<any, any[]>;
            logger: import("@medusajs/types").Logger;
        };
    };
    /**
     * Run, Revert or Generate the migrations for the medusa app.
     *
     * @param moduleNames
     * @param linkModules
     * @param action
     */
    runModulesMigrations({ moduleNames, action, }?: {
        moduleNames?: never;
        action: "run";
    } | {
        moduleNames: string[];
        action: "revert" | "generate";
    }): Promise<void>;
    /**
     * Return an instance of the link module migration planner.
     */
    getLinksExecutionPlanner(): Promise<ILinkMigrationsPlanner>;
    /**
     * Run the modules loader without taking care of anything else. This is useful for running the loader as a separate action or to re run all modules loaders.
     */
    runModulesLoader(): Promise<void>;
    /**
     * Load all modules and bootstrap all the modules and links to be ready to be consumed
     * @param config
     */
    load(config?: {
        registerInContainer: boolean;
    }): Promise<MedusaAppOutput>;
}
//# sourceMappingURL=medusa-app-loader.d.ts.map