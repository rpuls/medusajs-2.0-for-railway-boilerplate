"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.traceRequestHandler = void 0;
exports.registerInstrumentation = registerInstrumentation;
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const cluster_1 = __importDefault(require("cluster"));
const telemetry_1 = require("@medusajs/telemetry");
const node_schedule_1 = require("node-schedule");
const utils_1 = require("@medusajs/framework/utils");
const logger_1 = require("@medusajs/framework/logger");
const loaders_1 = __importDefault(require("../loaders"));
const modules_sdk_1 = require("@medusajs/framework/modules-sdk");
const url_1 = require("url");
const EVERY_SIXTH_HOUR = "0 */6 * * *";
const CRON_SCHEDULE = EVERY_SIXTH_HOUR;
const INSTRUMENTATION_FILE = "instrumentation";
/**
 * Imports the "instrumentation.js" file from the root of the
 * directory and invokes the register function. The existence
 * of this file is optional, hence we ignore "ENOENT"
 * errors.
 */
async function registerInstrumentation(directory) {
    const fileSystem = new utils_1.FileSystem(directory);
    const exists = (await fileSystem.exists(`${INSTRUMENTATION_FILE}.ts`)) ||
        (await fileSystem.exists(`${INSTRUMENTATION_FILE}.js`));
    if (!exists) {
        return;
    }
    const instrumentation = await (0, utils_1.dynamicImport)(path_1.default.join(directory, INSTRUMENTATION_FILE));
    if (typeof instrumentation.register === "function") {
        logger_1.logger.info("OTEL registered");
        instrumentation.register();
    }
    else {
        logger_1.logger.info("Skipping instrumentation registration. No register function found.");
    }
}
/**
 * Wrap request handler inside custom implementation to enabled
 * instrumentation.
 */
// eslint-disable-next-line no-var
exports.traceRequestHandler = void 0;
function displayAdminUrl({ host, port, container, }) {
    const isProduction = ["production", "prod"].includes(process.env.NODE_ENV || "");
    if (isProduction) {
        return;
    }
    const logger = container.resolve("logger");
    const { admin: { path: adminPath, disable }, } = container.resolve("configModule");
    if (disable) {
        return;
    }
    logger.info(`Admin URL → http://${host || "localhost"}:${port}${adminPath}`);
}
/**
 * Retrieve the route path from the express stack based on the input url
 * @param stack - The express stack
 * @param url - The input url
 * @returns The route path
 */
function findExpressRoutePath({ stack, url, }) {
    const stackToProcess = [...stack];
    while (stackToProcess.length > 0) {
        const layer = stackToProcess.pop();
        if (layer.name === "bound dispatch" && layer.match(url)) {
            return layer.route.path;
        }
        // Add nested stack items to be processed if they exist
        if (layer.handle?.stack?.length) {
            stackToProcess.push(...layer.handle.stack);
        }
    }
    return undefined;
}
async function start(args) {
    const { port = 9000, host, directory, types } = args;
    async function internalStart(generateTypes) {
        (0, telemetry_1.track)("CLI_START");
        await registerInstrumentation(directory);
        const app = (0, express_1.default)();
        const http_ = http_1.default.createServer(async (req, res) => {
            const stack = app._router.stack;
            await new Promise((resolve) => {
                res.on("finish", resolve);
                if (exports.traceRequestHandler) {
                    const expressHandlerPath = findExpressRoutePath({
                        stack,
                        url: (0, url_1.parse)(req.url, false).pathname,
                    });
                    void (0, exports.traceRequestHandler)(async () => {
                        app(req, res);
                    }, req, res, expressHandlerPath);
                }
                else {
                    app(req, res);
                }
            });
        });
        try {
            const { shutdown, gqlSchema, container, modules } = await (0, loaders_1.default)({
                directory,
                expressApp: app,
            });
            if (generateTypes) {
                const typesDirectory = path_1.default.join(directory, ".medusa/types");
                /**
                 * Cleanup existing types directory before creating new artifacts
                 */
                await new utils_1.FileSystem(typesDirectory).cleanup({ recursive: true });
                await (0, utils_1.generateContainerTypes)(modules, {
                    outputDir: typesDirectory,
                    interfaceName: "ModuleImplementations",
                });
                logger_1.logger.debug("Generated container types");
                if (gqlSchema) {
                    await (0, utils_1.gqlSchemaToTypes)({
                        outputDir: typesDirectory,
                        filename: "query-entry-points",
                        interfaceName: "RemoteQueryEntryPoints",
                        schema: gqlSchema,
                        joinerConfigs: modules_sdk_1.MedusaModule.getAllJoinerConfigs(),
                    });
                    logger_1.logger.debug("Generated modules types");
                }
            }
            const serverActivity = logger_1.logger.activity(`Creating server`);
            // Register a health check endpoint. Ideally this also checks the readiness of the service, rather than just returning a static response.
            app.get("/health", (_, res) => {
                res.status(200).send("OK");
            });
            const server = utils_1.GracefulShutdownServer.create(http_.listen(port, host).on("listening", () => {
                logger_1.logger.success(serverActivity, `Server is ready on port: ${port}`);
                displayAdminUrl({ container, host, port });
                (0, telemetry_1.track)("CLI_START_COMPLETED");
            }));
            // Handle graceful shutdown
            const gracefulShutDown = () => {
                logger_1.logger.info("Gracefully shutting down server");
                server
                    .shutdown()
                    .then(async () => {
                    await shutdown();
                    process.exit(0);
                })
                    .catch((e) => {
                    logger_1.logger.error("Error received when shutting down the server.", e);
                    process.exit(1);
                });
            };
            process.on("SIGTERM", gracefulShutDown);
            process.on("SIGINT", gracefulShutDown);
            (0, node_schedule_1.scheduleJob)(CRON_SCHEDULE, () => {
                (0, telemetry_1.track)("PING");
            });
            return { server };
        }
        catch (err) {
            logger_1.logger.error("Error starting server", err);
            process.exit(1);
        }
    }
    /**
     * When the cluster flag is used we will start the process in
     * cluster mode
     */
    if ("cluster" in args) {
        const maxCpus = os_1.default.cpus().length;
        const cpus = args.cluster ?? maxCpus;
        if (cluster_1.default.isPrimary) {
            let isShuttingDown = false;
            const numCPUs = Math.min(maxCpus, cpus);
            const killMainProccess = () => process.exit(0);
            const gracefulShutDown = () => {
                isShuttingDown = true;
                for (const id of Object.keys(cluster_1.default.workers ?? {})) {
                    cluster_1.default.workers?.[id]?.kill("SIGTERM");
                }
            };
            for (let index = 0; index < numCPUs; index++) {
                cluster_1.default.fork().send({ index });
            }
            cluster_1.default.on("exit", () => {
                if (!isShuttingDown) {
                    cluster_1.default.fork();
                }
                else if (!(0, utils_1.isPresent)(cluster_1.default.workers)) {
                    setTimeout(killMainProccess, 100);
                }
            });
            process.on("SIGTERM", gracefulShutDown);
            process.on("SIGINT", gracefulShutDown);
        }
        else {
            process.on("message", async (msg) => {
                if (msg.index > 0) {
                    process.env.PLUGIN_ADMIN_UI_SKIP_CACHE = "true";
                }
                await internalStart(!!types && msg.index === 0);
            });
        }
    }
    else {
        /**
         * Not in cluster mode
         */
        await internalStart(!!types);
    }
}
exports.default = start;
//# sourceMappingURL=start.js.map