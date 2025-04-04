"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.featureFlagRouter = void 0;
exports.featureFlagsLoader = featureFlagsLoader;
const telemetry_1 = require("@medusajs/telemetry");
const utils_1 = require("@medusajs/utils");
const awilix_1 = require("awilix");
const path_1 = require("path");
const config_1 = require("../config");
const container_1 = require("../container");
const logger_1 = require("../logger");
exports.featureFlagRouter = new utils_1.FlagRouter({});
container_1.container.register(utils_1.ContainerRegistrationKeys.FEATURE_FLAG_ROUTER, (0, awilix_1.asFunction)(() => exports.featureFlagRouter));
const excludedFiles = ["index.js", "index.ts"];
const excludedExtensions = [".d.ts", ".d.ts.map", ".js.map"];
const flagConfig = {};
function registerFlag(flag, projectConfigFlags) {
    flagConfig[flag.key] = (0, utils_1.isTruthy)(flag.default_val);
    let from;
    if ((0, utils_1.isDefined)(process.env[flag.env_key])) {
        from = "environment";
        const envVal = process.env[flag.env_key];
        // MEDUSA_FF_ANALYTICS="true"
        flagConfig[flag.key] = (0, utils_1.isTruthy)(process.env[flag.env_key]);
        const parsedFromEnv = (0, utils_1.isString)(envVal) ? envVal.split(",") : [];
        // MEDUSA_FF_WORKFLOWS=createProducts,deleteProducts
        if (parsedFromEnv.length > 1) {
            flagConfig[flag.key] = (0, utils_1.objectFromStringPath)(parsedFromEnv);
        }
    }
    else if ((0, utils_1.isDefined)(projectConfigFlags[flag.key])) {
        from = "project config";
        // featureFlags: { analytics: "true" | true }
        flagConfig[flag.key] = (0, utils_1.isTruthy)(projectConfigFlags[flag.key]);
        // featureFlags: { workflows: { createProducts: true } }
        if ((0, utils_1.isObject)(projectConfigFlags[flag.key])) {
            flagConfig[flag.key] = projectConfigFlags[flag.key];
        }
    }
    if (logger_1.logger && from) {
        logger_1.logger.info(`Using flag ${flag.env_key} from ${from} with value ${flagConfig[flag.key]}`);
    }
    if (flagConfig[flag.key]) {
        (0, telemetry_1.trackFeatureFlag)(flag.key);
    }
    exports.featureFlagRouter.setFlag(flag.key, flagConfig[flag.key]);
}
/**
 * Load feature flags from a directory and from the already loaded config under the hood
 * @param sourcePath
 */
async function featureFlagsLoader(sourcePath) {
    const { featureFlags: projectConfigFlags = {} } = config_1.configManager.config;
    if (!sourcePath) {
        return exports.featureFlagRouter;
    }
    const flagDir = (0, path_1.normalize)(sourcePath);
    await (0, utils_1.readDirRecursive)(flagDir).then(async (files) => {
        if (!files?.length) {
            return;
        }
        files.map(async (file) => {
            if (file.isDirectory()) {
                return await featureFlagsLoader((0, path_1.join)(flagDir, file.name));
            }
            if (excludedExtensions.some((ext) => file.name.endsWith(ext)) ||
                excludedFiles.includes(file.name)) {
                return;
            }
            const fileExports = await (0, utils_1.dynamicImport)((0, path_1.join)(flagDir, file.name));
            const featureFlag = fileExports.default;
            if (!featureFlag) {
                return;
            }
            registerFlag(featureFlag, projectConfigFlags);
            return;
        });
    });
    return exports.featureFlagRouter;
}
//# sourceMappingURL=feature-flag-loader.js.map