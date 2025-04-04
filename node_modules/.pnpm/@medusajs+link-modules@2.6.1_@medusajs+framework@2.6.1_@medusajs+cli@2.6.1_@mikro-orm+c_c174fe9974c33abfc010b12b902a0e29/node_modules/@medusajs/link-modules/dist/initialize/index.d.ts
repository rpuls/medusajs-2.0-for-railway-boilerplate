import { ExternalModuleDeclaration, ILinkModule, InternalModuleDeclaration, ModuleJoinerConfig, ModuleServiceInitializeCustomDataLayerOptions, ModuleServiceInitializeOptions } from "@medusajs/framework/types";
import { MigrationsExecutionPlanner } from "../migration";
import { InitializeModuleInjectableDependencies } from "../types";
export declare const initialize: (options?: ModuleServiceInitializeOptions | ModuleServiceInitializeCustomDataLayerOptions | ExternalModuleDeclaration | InternalModuleDeclaration, pluginLinksDefinitions?: ModuleJoinerConfig[], injectedDependencies?: InitializeModuleInjectableDependencies) => Promise<{
    [link: string]: ILinkModule;
}>;
/**
 * Prepare an execution plan and run the migrations accordingly.
 * It includes creating, updating, deleting the tables according to the execution plan.
 * If any unsafe sql is identified then we will notify the user to act manually.
 *
 * @param options
 * @param pluginLinksDefinition
 */
export declare function getMigrationPlanner(options: ModuleServiceInitializeOptions, pluginLinksDefinition?: ModuleJoinerConfig[]): MigrationsExecutionPlanner;
//# sourceMappingURL=index.d.ts.map