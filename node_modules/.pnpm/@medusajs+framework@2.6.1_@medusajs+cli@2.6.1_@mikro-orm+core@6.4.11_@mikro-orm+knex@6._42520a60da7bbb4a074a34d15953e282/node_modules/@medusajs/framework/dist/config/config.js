"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _ConfigManager_instances, _ConfigManager_baseDir, _ConfigManager_isProduction_get, _ConfigManager_envWorkMode_get, _ConfigManager_config;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigManager = void 0;
const utils_1 = require("@medusajs/utils");
const logger_1 = require("../logger");
class ConfigManager {
    get config() {
        if (!__classPrivateFieldGet(this, _ConfigManager_config, "f")) {
            this.rejectErrors(`Config not loaded. Make sure the config have been loaded first using the 'configLoader' or 'configManager.loadConfig'.`);
        }
        return __classPrivateFieldGet(this, _ConfigManager_config, "f");
    }
    get baseDir() {
        return __classPrivateFieldGet(this, _ConfigManager_baseDir, "f");
    }
    get isProduction() {
        return __classPrivateFieldGet(this, _ConfigManager_instances, "a", _ConfigManager_isProduction_get);
    }
    constructor() {
        _ConfigManager_instances.add(this);
        /**
         * Root dir from where to start
         * @private
         */
        _ConfigManager_baseDir.set(this, void 0);
        /**
         * The config object after loading it
         * @private
         */
        _ConfigManager_config.set(this, void 0);
    }
    /**
     * Rejects an error either by throwing when in production or by logging the error as a warning
     * @param error
     * @protected
     */
    rejectErrors(error) {
        if (__classPrivateFieldGet(this, _ConfigManager_instances, "a", _ConfigManager_isProduction_get)) {
            throw new Error(`[config] ⚠️ ${error}`);
        }
        logger_1.logger.warn(error);
    }
    /**
     * Builds the http config object and assign the defaults if needed
     * @param projectConfig
     * @protected
     */
    buildHttpConfig(projectConfig) {
        const http = (projectConfig.http ??
            {});
        http.jwtExpiresIn = http?.jwtExpiresIn ?? "1d";
        http.authCors = http.authCors ?? "";
        http.storeCors = http.storeCors ?? "";
        http.adminCors = http.adminCors ?? "";
        http.jwtSecret = http?.jwtSecret ?? process.env.JWT_SECRET;
        if (!http.jwtSecret) {
            this.rejectErrors(`http.jwtSecret not found.${__classPrivateFieldGet(this, _ConfigManager_instances, "a", _ConfigManager_isProduction_get) ? "" : "Using default 'supersecret'."}`);
            http.jwtSecret = "supersecret";
        }
        http.cookieSecret = (projectConfig.http?.cookieSecret ??
            process.env.COOKIE_SECRET);
        if (!http.cookieSecret) {
            this.rejectErrors(`http.cookieSecret not found.${__classPrivateFieldGet(this, _ConfigManager_instances, "a", _ConfigManager_isProduction_get) ? "" : " Using default 'supersecret'."}`);
            http.cookieSecret = "supersecret";
        }
        return http;
    }
    /**
     * Normalizes the project config object and assign the defaults if needed
     * @param projectConfig
     * @protected
     */
    normalizeProjectConfig(projectConfig) {
        const outputConfig = (0, utils_1.deepCopy)(projectConfig);
        if (!outputConfig?.redisUrl) {
            console.log(`redisUrl not found. A fake redis instance will be used.`);
        }
        outputConfig.http = this.buildHttpConfig(projectConfig);
        let workerMode = outputConfig?.workerMode;
        if (!(0, utils_1.isDefined)(workerMode)) {
            const env = __classPrivateFieldGet(this, _ConfigManager_instances, "a", _ConfigManager_envWorkMode_get);
            if ((0, utils_1.isDefined)(env)) {
                const workerModes = ["shared", "worker", "server"];
                if (workerModes.includes(env)) {
                    workerMode = env;
                }
            }
            else {
                workerMode = "shared";
            }
        }
        return {
            ...outputConfig,
            workerMode,
        };
    }
    /**
     * Prepare the full configuration after validation and normalization
     */
    loadConfig({ projectConfig = {}, baseDir, }) {
        __classPrivateFieldSet(this, _ConfigManager_baseDir, baseDir, "f");
        const normalizedProjectConfig = this.normalizeProjectConfig(projectConfig.projectConfig ?? {});
        __classPrivateFieldSet(this, _ConfigManager_config, {
            projectConfig: normalizedProjectConfig,
            admin: projectConfig.admin ?? {},
            modules: projectConfig.modules ?? {},
            featureFlags: projectConfig.featureFlags ?? {},
            plugins: projectConfig.plugins ?? [],
        }, "f");
        return __classPrivateFieldGet(this, _ConfigManager_config, "f");
    }
}
exports.ConfigManager = ConfigManager;
_ConfigManager_baseDir = new WeakMap(), _ConfigManager_config = new WeakMap(), _ConfigManager_instances = new WeakSet(), _ConfigManager_isProduction_get = function _ConfigManager_isProduction_get() {
    return ["production", "prod"].includes(process.env.NODE_ENV || "");
}, _ConfigManager_envWorkMode_get = function _ConfigManager_envWorkMode_get() {
    return process.env
        .MEDUSA_WORKER_MODE;
};
//# sourceMappingURL=config.js.map