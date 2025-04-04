import { MikroORM, type Configuration, type IDatabaseDriver, type Options } from '@mikro-orm/core';
/**
 * @internal
 */
export declare class CLIHelper {
    static getConfiguration<D extends IDatabaseDriver = IDatabaseDriver>(contextName?: string, configPaths?: string[], options?: Partial<Options<D>>): Promise<Configuration<D>>;
    static getORM<D extends IDatabaseDriver = IDatabaseDriver>(contextName?: string, configPaths?: string[], opts?: Partial<Options<D>>): Promise<MikroORM<D>>;
    static isDBConnected(config: Configuration, reason?: false): Promise<boolean>;
    static isDBConnected(config: Configuration, reason: true): Promise<true | string>;
    static getNodeVersion(): string;
    static getDriverDependencies(config: Configuration): string[];
    static dump(text: string, config?: Configuration): void;
    static getConfigPaths(): string[];
    static dumpDependencies(): Promise<void>;
    static getModuleVersion(name: string): Promise<string>;
    static dumpTable(options: {
        columns: string[];
        rows: string[][];
        empty: string;
    }): void;
    static showHelp(): void;
}
