"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const awilix_1 = require("awilix");
const ioredis_1 = __importDefault(require("ioredis"));
exports.default = async ({ container, logger, options, }) => {
    const { redisUrl, redisOptions } = options;
    if (!redisUrl) {
        throw Error("No `redisUrl` provided in `cacheService` module options. It is required for the Redis Cache Module.");
    }
    const connection = new ioredis_1.default(redisUrl, {
        // Lazy connect to properly handle connection errors
        lazyConnect: true,
        ...(redisOptions ?? {}),
    });
    try {
        await connection.connect();
        logger?.info(`Connection to Redis in module 'cache-redis' established`);
    }
    catch (err) {
        logger?.error(`An error occurred while connecting to Redis in module 'cache-redis': ${err}`);
    }
    container.register({
        cacheRedisConnection: (0, awilix_1.asValue)(connection),
    });
};
//# sourceMappingURL=index.js.map