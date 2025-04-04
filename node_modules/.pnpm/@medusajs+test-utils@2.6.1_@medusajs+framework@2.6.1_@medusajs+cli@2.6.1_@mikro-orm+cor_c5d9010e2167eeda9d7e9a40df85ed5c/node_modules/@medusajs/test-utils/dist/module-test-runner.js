"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.moduleIntegrationTestRunner = moduleIntegrationTestRunner;
const utils_1 = require("@medusajs/framework/utils");
const fs = __importStar(require("fs"));
const database_1 = require("./database");
const init_modules_1 = require("./init-modules");
const mock_event_bus_service_1 = __importDefault(require("./mock-event-bus-service"));
function createMikroOrmWrapper(options) {
    let moduleModels = options.moduleModels ?? [];
    if (!options.moduleModels) {
        const basePath = (0, utils_1.normalizeImportPathWithSource)(options.resolve ?? process.cwd());
        const modelsPath = fs.existsSync(`${basePath}/dist/models`)
            ? "/dist/models"
            : fs.existsSync(`${basePath}/models`)
                ? "/models"
                : "";
        if (modelsPath) {
            moduleModels = (0, utils_1.loadModels)(`${basePath}${modelsPath}`);
        }
        else {
            moduleModels = [];
        }
    }
    moduleModels = (0, utils_1.toMikroOrmEntities)(moduleModels);
    const MikroOrmWrapper = (0, database_1.getMikroOrmWrapper)({
        mikroOrmEntities: moduleModels,
        clientUrl: options.dbConfig.clientUrl,
        schema: options.dbConfig.schema,
    });
    return { MikroOrmWrapper, models: moduleModels };
}
function moduleIntegrationTestRunner({ moduleName, moduleModels, moduleOptions = {}, moduleDependencies, joinerConfig = [], schema = "public", debug = false, testSuite, resolve, injectedDependencies = {}, }) {
    const moduleSdkImports = require("@medusajs/framework/modules-sdk");
    process.env.LOG_LEVEL = "error";
    const tempName = parseInt(process.env.JEST_WORKER_ID || "1");
    const dbName = `medusa-${moduleName.toLowerCase()}-integration-${tempName}`;
    const dbConfig = {
        clientUrl: (0, database_1.getDatabaseURL)(dbName),
        schema,
        debug,
    };
    // Use a unique connection for all the entire suite
    const connection = utils_1.ModulesSdkUtils.createPgConnection(dbConfig);
    const { MikroOrmWrapper, models } = createMikroOrmWrapper({
        moduleModels,
        resolve,
        dbConfig,
    });
    moduleModels = models;
    const modulesConfig_ = {
        [moduleName]: {
            definition: moduleSdkImports.ModulesDefinition[moduleName],
            resolve,
            dependencies: moduleDependencies,
            options: {
                database: dbConfig,
                ...moduleOptions,
                [utils_1.isSharedConnectionSymbol]: true,
            },
        },
    };
    const moduleOptions_ = {
        injectedDependencies: {
            [utils_1.ContainerRegistrationKeys.PG_CONNECTION]: connection,
            [utils_1.Modules.EVENT_BUS]: new mock_event_bus_service_1.default(),
            [utils_1.ContainerRegistrationKeys.LOGGER]: console,
            ...injectedDependencies,
        },
        modulesConfig: modulesConfig_,
        databaseConfig: dbConfig,
        joinerConfig,
        preventConnectionDestroyWarning: true,
    };
    let shutdown;
    let moduleService;
    let medusaApp = {};
    const options = {
        MikroOrmWrapper,
        medusaApp: new Proxy({}, {
            get: (target, prop) => {
                return medusaApp[prop];
            },
        }),
        service: new Proxy({}, {
            get: (target, prop) => {
                return moduleService[prop];
            },
        }),
        dbConfig: {
            schema,
            clientUrl: dbConfig.clientUrl,
        },
    };
    const beforeEach_ = async () => {
        if (moduleModels.length) {
            await MikroOrmWrapper.setupDatabase();
        }
        const output = await (0, init_modules_1.initModules)(moduleOptions_);
        shutdown = output.shutdown;
        medusaApp = output.medusaApp;
        moduleService = output.medusaApp.modules[moduleName];
    };
    const afterEach_ = async () => {
        if (moduleModels.length) {
            await MikroOrmWrapper.clearDatabase();
        }
        await shutdown();
        moduleService = {};
        medusaApp = {};
    };
    return describe("", () => {
        beforeEach(beforeEach_);
        afterEach(afterEach_);
        afterAll(async () => {
            await connection.context?.destroy();
            await connection.destroy();
        });
        testSuite(options);
    });
}
//# sourceMappingURL=module-test-runner.js.map