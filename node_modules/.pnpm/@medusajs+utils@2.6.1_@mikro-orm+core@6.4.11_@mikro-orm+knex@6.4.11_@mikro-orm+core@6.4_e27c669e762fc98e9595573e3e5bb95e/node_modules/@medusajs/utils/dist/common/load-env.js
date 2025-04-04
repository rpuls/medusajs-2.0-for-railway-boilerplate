"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadEnv = loadEnv;
const dotenv_1 = __importDefault(require("dotenv"));
const dotenv_expand_1 = require("dotenv-expand");
const path_1 = require("path");
const KNOWN_ENVIRONMENTS = ["staging", "production", "test"];
/**
 * Loads ".env" file based upon the environment in which the
 * app is running.
 *
 * - Loads ".env" file by default.
 * - Loads ".env.staging" when "environment=staging".
 * - Loads ".env.production" when "environment=production".
 * - Loads ".env.test" when "environment=test".
 *
 * The ".env" file is always loaded alongside the environment
 * specific .env file.
 *
 * This method does not return any value and updates the "process.env"
 * object instead.
 */
function loadEnv(environment, envDir) {
    const filesToLoad = KNOWN_ENVIRONMENTS.includes(environment)
        ? [`.env.${environment}`, ".env"].map((file) => (0, path_1.join)(envDir, file))
        : [(0, path_1.join)(envDir, ".env")];
    try {
        (0, dotenv_expand_1.expand)(dotenv_1.default.config({ path: filesToLoad }));
    }
    catch { }
}
//# sourceMappingURL=load-env.js.map