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
exports.default = developPlugin;
const path_1 = __importDefault(require("path"));
const swcCore = __importStar(require("@swc/core"));
const child_process_1 = require("child_process");
const logger_1 = require("@medusajs/framework/logger");
const build_tools_1 = require("@medusajs/framework/build-tools");
async function developPlugin({ directory, }) {
    let isBusy = false;
    const compiler = new build_tools_1.Compiler(directory, logger_1.logger);
    const parsedConfig = await compiler.loadTSConfigFile();
    if (!parsedConfig) {
        return;
    }
    const yalcBin = path_1.default.join(path_1.default.dirname(require.resolve("yalc")), "yalc.js");
    /**
     * Publishes the build output to the registry and updates
     * installations
     */
    function publishChanges() {
        /**
         * Here we avoid multiple publish calls when the filesystem is
         * changed too quickly. This might result in stale content in
         * some edge cases. However, not preventing multiple publishes
         * at the same time will result in race conditions and the old
         * output might appear in the published package.
         */
        if (isBusy) {
            return;
        }
        isBusy = true;
        /**
         * Yalc is meant to be used a binary and not as a long-lived
         * module import. Therefore we will have to execute it like
         * a command to get desired outcome. Otherwise, yalc behaves
         * flaky.
         */
        (0, child_process_1.execFile)(yalcBin, ["publish", "--push", "--no-scripts"], {
            cwd: directory,
        }, (error, stdout, stderr) => {
            isBusy = false;
            if (error) {
                console.log(error);
            }
            console.log(stdout);
            console.error(stderr);
        });
    }
    /**
     * Transforms a given file using @swc/core
     */
    async function transformFile(filePath) {
        const output = await swcCore.transformFile(filePath, {
            sourceMaps: "inline",
            module: {
                type: "commonjs",
                strictMode: true,
                noInterop: false,
            },
            jsc: {
                externalHelpers: false,
                target: "es2021",
                parser: {
                    syntax: "typescript",
                    tsx: true,
                    decorators: true,
                    dynamicImport: true,
                },
                transform: {
                    legacyDecorator: true,
                    decoratorMetadata: true,
                    react: {
                        throwIfNamespace: false,
                        useBuiltins: false,
                        pragma: "React.createElement",
                        pragmaFrag: "React.Fragment",
                        importSource: "react",
                        runtime: "automatic",
                    },
                },
                keepClassNames: true,
                baseUrl: directory,
            },
        });
        return output.code;
    }
    await compiler.buildPluginBackend(parsedConfig);
    await compiler.developPluginBackend(transformFile, publishChanges);
}
//# sourceMappingURL=develop.js.map