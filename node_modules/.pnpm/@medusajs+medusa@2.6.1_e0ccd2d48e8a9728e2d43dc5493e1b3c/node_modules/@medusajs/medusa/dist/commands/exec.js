"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exec;
const loaders_1 = __importDefault(require("../loaders"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
const logger_1 = require("@medusajs/framework/logger");
const utils_1 = require("@medusajs/framework/utils");
async function exec({ file, args }) {
    logger_1.logger.info(`Executing script at ${file}...`);
    const app = (0, express_1.default)();
    const directory = process.cwd();
    try {
        // check if the file exists
        const filePath = path_1.default.resolve(directory, file);
        if (!(0, fs_1.existsSync)(filePath)) {
            throw new Error(`File ${filePath} doesn't exist.`);
        }
        const scriptToExec = (await (0, utils_1.dynamicImport)(path_1.default.resolve(filePath))).default;
        if (!scriptToExec || typeof scriptToExec !== "function") {
            throw new Error(`File doesn't default export a function to execute.`);
        }
        // set worker mode
        process.env.MEDUSA_WORKER_MODE = "worker";
        const { container } = await (0, loaders_1.default)({
            directory,
            expressApp: app,
        });
        const scriptParams = {
            container,
            args,
        };
        await scriptToExec(scriptParams);
        logger_1.logger.info(`Finished executing script.`);
        process.exit();
    }
    catch (err) {
        logger_1.logger.error("Error running script", err);
        process.exit(1);
    }
}
//# sourceMappingURL=exec.js.map