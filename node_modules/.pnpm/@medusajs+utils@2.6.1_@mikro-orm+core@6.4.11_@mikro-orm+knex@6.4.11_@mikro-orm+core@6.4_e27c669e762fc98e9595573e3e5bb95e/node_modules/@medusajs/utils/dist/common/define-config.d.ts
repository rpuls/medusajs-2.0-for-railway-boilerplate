import { ConfigModule, InputConfig, InputConfigModules } from "@medusajs/types";
export declare const DEFAULT_STORE_RESTRICTED_FIELDS: string[];
/**
 * The "defineConfig" helper can be used to define the configuration
 * of a medusa application.
 *
 * The helper under the hood merges your config with a set of defaults to
 * make an application work seamlessly, but still provide you the ability
 * to override configuration as needed.
 */
export declare function defineConfig(config?: InputConfig): ConfigModule;
/**
 * Transforms an array of modules into an object. The last module will
 * take precedence in case of duplicate modules
 */
export declare function transformModules(modules: InputConfigModules): Exclude<ConfigModule["modules"], undefined>;
//# sourceMappingURL=define-config.d.ts.map