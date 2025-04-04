"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("@medusajs/framework/logger");
const create_1 = require("./create");
const migrate_1 = require("./migrate");
const main = async function ({ directory, interactive, db, skipLinks, skipScripts, executeAllLinks, executeSafeLinks, }) {
    try {
        const created = await (0, create_1.dbCreate)({ directory, interactive, db });
        if (!created) {
            process.exit(1);
        }
        const migrated = await (0, migrate_1.migrate)({
            directory,
            skipLinks,
            skipScripts,
            executeAllLinks,
            executeSafeLinks,
        });
        process.exit(migrated ? 0 : 1);
    }
    catch (error) {
        if (error.name === "ExitPromptError") {
            process.exit();
        }
        logger_1.logger.error(error);
        process.exit(1);
    }
};
exports.default = main;
//# sourceMappingURL=setup.js.map