"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.expressLoader = expressLoader;
const connect_redis_1 = __importDefault(require("connect-redis"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const ioredis_1 = __importDefault(require("ioredis"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const logger_1 = require("../logger");
const config_1 = require("../config");
const NOISY_ENDPOINTS_CHUNKS = ["@fs", "@id", "@vite", "@react", "node_modules"];
const isHealthCheck = (req) => req.path === "/health";
async function expressLoader({ app }) {
    const baseDir = config_1.configManager.baseDir;
    const configModule = config_1.configManager.config;
    const isProduction = config_1.configManager.isProduction;
    const NODE_ENV = process.env.NODE_ENV || "development";
    const IS_DEV = NODE_ENV.startsWith("dev");
    const isStaging = NODE_ENV === "staging";
    const isTest = NODE_ENV === "test";
    let sameSite = false;
    let secure = false;
    if (isProduction || isStaging) {
        secure = true;
        sameSite = "none";
    }
    const { http, sessionOptions } = configModule.projectConfig;
    const sessionOpts = {
        name: sessionOptions?.name ?? "connect.sid",
        resave: sessionOptions?.resave ?? true,
        rolling: sessionOptions?.rolling ?? false,
        saveUninitialized: sessionOptions?.saveUninitialized ?? true,
        proxy: true,
        secret: sessionOptions?.secret ?? http?.cookieSecret,
        cookie: {
            sameSite,
            secure,
            maxAge: sessionOptions?.ttl ?? 10 * 60 * 60 * 1000,
        },
        store: null,
    };
    let redisClient;
    if (configModule?.projectConfig?.redisUrl) {
        const RedisStore = (0, connect_redis_1.default)(express_session_1.default);
        redisClient = new ioredis_1.default(configModule.projectConfig.redisUrl, configModule.projectConfig.redisOptions ?? {});
        sessionOpts.store = new RedisStore({
            client: redisClient,
            prefix: `${configModule?.projectConfig?.redisPrefix ?? ""}sess:`,
        });
    }
    app.set("trust proxy", 1);
    /**
     * Method to skip logging HTTP requests. We skip in test environment
     * and also exclude files served by vite during development
     */
    function shouldSkipHttpLog(req, res) {
        return (isTest ||
            isHealthCheck(req) ||
            NOISY_ENDPOINTS_CHUNKS.some((chunk) => req.url.includes(chunk)) ||
            !logger_1.logger.shouldLog("http"));
    }
    let loggingMiddleware;
    /**
     * The middleware to use for logging. We write the log messages
     * using winston, but rely on morgan to hook into HTTP requests
     */
    if (!IS_DEV) {
        const jsonFormat = (tokens, req, res) => {
            const result = {
                level: "http",
                // client ip
                client_ip: req.ip || "-",
                // Request ID can be correlated with other logs (like error reports)
                request_id: req.requestId || "-",
                // Standard HTTP request properties
                http_version: tokens["http-version"](req, res),
                method: tokens.method(req, res),
                path: tokens.url(req, res),
                // Response details
                status: Number(tokens.status(req, res)),
                response_size: tokens.res(req, res, "content-length") || 0,
                request_size: tokens.req(req, res, "content-length") || 0,
                duration: Number(tokens["response-time"](req, res)),
                // Useful headers that might help in debugging or tracing
                referrer: tokens.referrer(req, res) || "-",
                user_agent: tokens["user-agent"](req, res),
                timestamp: new Date().toISOString(),
            };
            return JSON.stringify(result);
        };
        loggingMiddleware = (0, morgan_1.default)(jsonFormat, {
            skip: shouldSkipHttpLog,
        });
    }
    else {
        loggingMiddleware = (0, morgan_1.default)(":method :url ← :referrer (:status) - :response-time ms", {
            skip: shouldSkipHttpLog,
            stream: {
                write: (message) => logger_1.logger.http(message.trim()),
            },
        });
    }
    app.use(loggingMiddleware);
    app.use((0, cookie_parser_1.default)());
    app.use((0, express_session_1.default)(sessionOpts));
    // Currently we don't allow configuration of static files, but this can be revisited as needed.
    app.use("/static", express_1.default.static(path_1.default.join(baseDir, "static")));
    const shutdown = async () => {
        redisClient?.disconnect();
    };
    return { app, shutdown };
}
//# sourceMappingURL=express-loader.js.map