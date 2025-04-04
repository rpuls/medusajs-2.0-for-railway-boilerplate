import { TestDatabase } from "./database";
export interface SuiteOptions<TService = unknown> {
    MikroOrmWrapper: TestDatabase;
    medusaApp: any;
    service: TService;
    dbConfig: {
        schema: string;
        clientUrl: string;
    };
}
export declare function moduleIntegrationTestRunner<TService = any>({ moduleName, moduleModels, moduleOptions, moduleDependencies, joinerConfig, schema, debug, testSuite, resolve, injectedDependencies, }: {
    moduleName: string;
    moduleModels?: any[];
    moduleOptions?: Record<string, any>;
    moduleDependencies?: string[];
    joinerConfig?: any[];
    schema?: string;
    dbName?: string;
    injectedDependencies?: Record<string, any>;
    resolve?: string;
    debug?: boolean;
    testSuite: (options: SuiteOptions<TService>) => void;
}): void;
//# sourceMappingURL=module-test-runner.d.ts.map