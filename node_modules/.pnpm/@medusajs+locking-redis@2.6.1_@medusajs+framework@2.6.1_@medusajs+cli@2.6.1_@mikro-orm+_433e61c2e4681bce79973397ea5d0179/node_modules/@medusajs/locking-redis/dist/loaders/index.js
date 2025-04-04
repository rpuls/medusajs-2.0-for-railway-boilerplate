"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const awilix_1 = require("awilix");
const ioredis_1 = __importDefault(require("ioredis"));
exports.default = async ({ container, logger, options, moduleOptions, }) => {
    const { redisUrl, redisOptions, namespace } = options;
    if (!redisUrl) {
        throw Error(`No "redisUrl" provided in "${utils_1.Modules.LOCKING}" module, "locking-redis" provider options. It is required for the "locking-redis" Module provider.`);
    }
    const connection = new ioredis_1.default(redisUrl, {
        // Lazy connect to properly handle connection errors
        lazyConnect: true,
        ...(redisOptions ?? {}),
    });
    try {
        await connection.connect();
        logger?.info(`Connection to Redis in "locking-redis" provider established`);
    }
    catch (err) {
        logger?.error(`An error occurred while connecting to Redis in provider "locking-redis": ${err}`);
    }
    container.register({
        redisClient: (0, awilix_1.asValue)(connection),
        prefix: (0, awilix_1.asValue)(namespace ?? "medusa_lock:"),
    });
};
//# sourceMappingURL=index.js.map