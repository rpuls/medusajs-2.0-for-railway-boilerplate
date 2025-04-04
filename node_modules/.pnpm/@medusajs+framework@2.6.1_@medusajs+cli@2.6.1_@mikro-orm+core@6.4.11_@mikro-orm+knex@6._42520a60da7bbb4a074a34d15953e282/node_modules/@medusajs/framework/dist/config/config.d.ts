import { ConfigModule } from "./types";
export declare class ConfigManager {
    #private;
    get config(): ConfigModule;
    get baseDir(): string;
    get isProduction(): boolean;
    constructor();
    /**
     * Rejects an error either by throwing when in production or by logging the error as a warning
     * @param error
     * @protected
     */
    protected rejectErrors(error: string): never | void;
    /**
     * Builds the http config object and assign the defaults if needed
     * @param projectConfig
     * @protected
     */
    protected buildHttpConfig(projectConfig: Partial<ConfigModule["projectConfig"]>): ConfigModule["projectConfig"]["http"];
    /**
     * Normalizes the project config object and assign the defaults if needed
     * @param projectConfig
     * @protected
     */
    protected normalizeProjectConfig(projectConfig: Partial<ConfigModule["projectConfig"]>): ConfigModule["projectConfig"];
    /**
     * Prepare the full configuration after validation and normalization
     */
    loadConfig({ projectConfig, baseDir, }: {
        projectConfig: Partial<ConfigModule>;
        baseDir: string;
    }): ConfigModule;
}
//# sourceMappingURL=config.d.ts.map