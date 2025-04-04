import { MedusaAppOutput } from "@medusajs/framework/modules-sdk";
import { MedusaContainer } from "@medusajs/framework/types";
export interface MedusaSuiteOptions {
    dbConnection: any;
    getContainer: () => MedusaContainer;
    api: any;
    dbUtils: {
        create: (dbName: string) => Promise<void>;
        teardown: (options: {
            schema?: string;
        }) => Promise<void>;
        shutdown: (dbName: string) => Promise<void>;
    };
    dbConfig: {
        dbName: string;
        schema: string;
        clientUrl: string;
    };
    getMedusaApp: () => MedusaAppOutput;
}
export declare function medusaIntegrationTestRunner({ moduleName, dbName, medusaConfigFile, schema, env, debug, inApp, testSuite, }: {
    moduleName?: string;
    env?: Record<string, any>;
    dbName?: string;
    medusaConfigFile?: string;
    schema?: string;
    debug?: boolean;
    inApp?: boolean;
    testSuite: (options: MedusaSuiteOptions) => void;
}): void;
//# sourceMappingURL=medusa-test-runner.d.ts.map