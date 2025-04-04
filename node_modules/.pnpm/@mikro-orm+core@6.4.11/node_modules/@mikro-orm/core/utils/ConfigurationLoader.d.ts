import type { EntityManager } from '../EntityManager';
import type { EntityManagerType, IDatabaseDriver } from '../drivers';
import type { Dictionary } from '../typings';
import { Configuration, type Options } from './Configuration';
/**
 * @internal
 */
export declare class ConfigurationLoader {
    /**
     * Gets a named configuration
     *
     * @param contextName Load a config with the given `contextName` value. Used when config file exports array or factory function. Setting it to "default" matches also config objects without `contextName` set.
     * @param paths Array of possible paths for a configuration file. Files will be checked in order, and the first existing one will be used. Defaults to the output of {@link ConfigurationLoader.getConfigPaths}.
     * @param options Additional options to augment the final configuration with.
     */
    static getConfiguration<D extends IDatabaseDriver = IDatabaseDriver, EM extends D[typeof EntityManagerType] & EntityManager = EntityManager>(contextName: string, paths?: string[], options?: Partial<Options>): Promise<Configuration<D, EM>>;
    /**
     * Gets the default config from the default paths
     *
     * @deprecated Prefer to explicitly set the `contextName` at the first argument. This signature is available for backwards compatibility, and may be removed in v7.
     */
    static getConfiguration<D extends IDatabaseDriver = IDatabaseDriver, EM extends D[typeof EntityManagerType] & EntityManager = EntityManager>(): Promise<Configuration<D, EM>>;
    /**
     * Gets default configuration out of the default paths, and possibly from `process.argv`
     *
     * @param validate Whether to validate the final configuration.
     * @param options Additional options to augment the final configuration with (just before validation).
     *
     * @deprecated Use the other overloads of this method. This signature will be removed in v7.
     */
    static getConfiguration<D extends IDatabaseDriver = IDatabaseDriver, EM extends D[typeof EntityManagerType] & EntityManager = EntityManager>(validate: boolean, options?: Partial<Options>): Promise<Configuration<D, EM>>;
    static getConfigFile(paths: string[]): Promise<[string, unknown] | []>;
    static getPackageConfig(basePath?: string): Dictionary;
    static getSettings(): Settings;
    static configPathsFromArg(): string[] | undefined;
    static getConfigPaths(): string[];
    static isESM(): boolean;
    static registerTsNode(configPath?: string): boolean;
    static registerDotenv<D extends IDatabaseDriver>(options?: Options<D> | Configuration<D>): void;
    static loadEnvironmentVars<D extends IDatabaseDriver>(): Partial<Options<D>>;
    static getORMPackages(): Set<string>;
    /** @internal */
    static commonJSCompat(options: Partial<Options>): void;
    static getORMPackageVersion(name: string): string | undefined;
    static checkPackageVersion(): string;
}
export interface Settings {
    alwaysAllowTs?: boolean;
    verbose?: boolean;
    useTsNode?: boolean;
    tsConfigPath?: string;
    configPaths?: string[];
}
