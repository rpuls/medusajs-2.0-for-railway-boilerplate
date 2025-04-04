import { ConfigModule } from "./types";
import { ConfigManager } from "./config";
export declare const configManager: ConfigManager;
/**
 * Loads the config file and returns the config module after validating, normalizing the configurations
 *
 * @param entryDirectory The directory to find the config file from
 * @param configFileName The name of the config file to search for in the entry directory
 */
export declare function configLoader(entryDirectory: string, configFileName: string): Promise<ConfigModule>;
//# sourceMappingURL=loader.d.ts.map