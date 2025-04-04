"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const boxen_1 = __importDefault(require("boxen"));
const child_process_1 = require("child_process");
const chokidar_1 = __importDefault(require("chokidar"));
const telemetry_1 = require("@medusajs/telemetry");
const os_1 = require("os");
const path_1 = __importDefault(require("path"));
const logger_1 = require("@medusajs/framework/logger");
const framework_1 = require("@medusajs/framework");
const defaultConfig = {
    padding: 5,
    borderColor: `blue`,
    borderStyle: `double`,
};
async function default_1({ types, directory }) {
    const args = process.argv;
    const argv = process.argv.indexOf("--") !== -1
        ? process.argv.slice(process.argv.indexOf("--") + 1)
        : [];
    args.shift();
    args.shift();
    args.shift();
    if (types) {
        args.push("--types");
    }
    /**
     * Re-constructing the path to Medusa CLI to execute the
     * start command.
     */
    const cliPath = path_1.default.resolve(framework_1.MEDUSA_CLI_PATH, "..", "..", "cli.js");
    const devServer = {
        childProcess: null,
        watcher: null,
        /**
         * Start the development server by forking a new process.
         *
         * We do not kill the parent process when child process dies. This is
         * because sometimes the dev server can die because of programming
         * or logical errors and we can still watch the file system and
         * restart the dev server instead of asking the user to re-run
         * the command.
         */
        start() {
            this.childProcess = (0, child_process_1.fork)(cliPath, ["start", ...args], {
                cwd: directory,
                env: {
                    ...process.env,
                    NODE_ENV: "development",
                },
                execArgv: argv,
            });
            this.childProcess.on("error", (error) => {
                // @ts-ignore
                logger_1.logger.error("Dev server failed to start", error);
                logger_1.logger.info("The server will restart automatically after your changes");
            });
        },
        /**
         * Restarts the development server by cleaning up the existing
         * child process and forking a new one
         */
        restart() {
            if (this.childProcess) {
                this.childProcess.removeAllListeners();
                if (process.platform === "win32") {
                    (0, child_process_1.execSync)(`taskkill /PID ${this.childProcess.pid} /F /T`);
                }
                else {
                    this.childProcess.kill("SIGINT");
                }
            }
            this.start();
        },
        /**
         * Watches the entire file system and ignores the following files
         *
         * - Dot files
         * - node_modules
         * - dist
         * - src/admin/**
         */
        watch() {
            this.watcher = chokidar_1.default.watch(["."], {
                ignoreInitial: true,
                cwd: process.cwd(),
                ignored: [
                    /(^|[\\/\\])\../,
                    "node_modules",
                    "dist",
                    "static",
                    "private",
                    "src/admin/**/*",
                    ".medusa/**/*",
                ],
            });
            this.watcher.on("add", (file) => {
                logger_1.logger.info(`${path_1.default.relative(directory, file)} created: Restarting dev server`);
                this.restart();
            });
            this.watcher.on("change", (file) => {
                logger_1.logger.info(`${path_1.default.relative(directory, file)} modified: Restarting dev server`);
                this.restart();
            });
            this.watcher.on("unlink", (file) => {
                logger_1.logger.info(`${path_1.default.relative(directory, file)} removed: Restarting dev server`);
                this.restart();
            });
            this.watcher.on("ready", function () {
                logger_1.logger.info(`Watching filesystem to reload dev server on file change`);
            });
        },
    };
    process.on("SIGINT", () => {
        const configStore = new telemetry_1.Store();
        const hasPrompted = configStore.getConfig("star.prompted") ?? false;
        if (!hasPrompted) {
            const defaultMessage = `✨ Thanks for using Medusa. ✨${os_1.EOL}${os_1.EOL}` +
                `If you liked it, please consider starring us on GitHub${os_1.EOL}` +
                `https://medusajs.com/star${os_1.EOL}` +
                `${os_1.EOL}` +
                `Note: you will not see this message again.`;
            console.log();
            console.log((0, boxen_1.default)(defaultMessage, defaultConfig));
            configStore.setConfig("star.prompted", true);
        }
        process.exit(0);
    });
    devServer.start();
    devServer.watch();
}
//# sourceMappingURL=develop.js.map