"use strict";
/**
 * Custom wrapper on top of MikroORM CLI to override the issue
 * they have when importing TypeScript files.
 *
 * They have hardcoded the module system of TypeScript to CommonJS
 * and that makes it impossible to use any other module system
 * like Node16 or NodeNext and so on.
 *
 * With this wrapper, we monkey patch the code responsible for register
 * ts-node and then boot their CLI. Since, the code footprint is
 * small, we should be okay with managing this wrapper.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const cli_1 = require("@mikro-orm/cli");
const core_1 = require("@mikro-orm/core");
const path_1 = require("path");
/**
 * Monkey patching the TSNode registration of Mikro ORM to not use
 * hardcoded module system with TypeScript.
 */
core_1.ConfigurationLoader.registerTsNode = function (configPath = "tsconfig.json") {
    const tsConfigPath = (0, path_1.isAbsolute)(configPath)
        ? configPath
        : (0, path_1.join)(process.cwd(), configPath);
    const tsNode = require(require.resolve("ts-node", { paths: [tsConfigPath] }));
    if (!tsNode) {
        return false;
    }
    const { options } = tsNode.register({
        project: tsConfigPath,
        transpileOnly: true,
    }).config;
    if (Object.entries(options?.paths ?? {}).length > 0) {
        require("tsconfig-paths").register({
            baseUrl: options.baseUrl ?? ".",
            paths: options.paths,
        });
    }
    return true;
};
require("@jercle/yargonaut")
    .style("blue")
    .style("yellow", "required")
    .helpStyle("green")
    .errorsStyle("red");
(async () => {
    const argv = await cli_1.CLIConfigurator.configure();
    const args = await argv.parse(process.argv.slice(2));
    if (args._.length === 0) {
        cli_1.CLIHelper.showHelp();
    }
})();
//# sourceMappingURL=bin.js.map