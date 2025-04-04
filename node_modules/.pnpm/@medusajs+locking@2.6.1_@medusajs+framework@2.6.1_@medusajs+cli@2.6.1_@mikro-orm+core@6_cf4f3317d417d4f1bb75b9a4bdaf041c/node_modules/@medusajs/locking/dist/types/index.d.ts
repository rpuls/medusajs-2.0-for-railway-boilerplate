import { ModuleProviderExports, ModuleServiceInitializeOptions } from "@medusajs/framework/types";
export declare const LockingDefaultProvider = "default_provider";
export declare const LockingIdentifiersRegistrationName = "locking_providers_identifier";
export declare const LockingProviderRegistrationPrefix = "lp_";
export type LockingModuleOptions = Partial<ModuleServiceInitializeOptions> & {
    /**
     * Providers to be registered
     */
    providers?: {
        /**
         * The module provider to be registered
         */
        resolve: string | ModuleProviderExports;
        /**
         * If the provider is the default
         */
        is_default?: boolean;
        /**
         * The id of the provider
         */
        id: string;
        /**
         * key value pair of the configuration to be passed to the provider constructor
         */
        options?: Record<string, unknown>;
    }[];
};
//# sourceMappingURL=index.d.ts.map