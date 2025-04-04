"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureDbExists = ensureDbExists;
const logger_1 = require("@medusajs/framework/logger");
const utils_1 = require("@medusajs/framework/utils");
async function ensureDbExists(container) {
    const pgConnection = container.resolve(utils_1.ContainerRegistrationKeys.PG_CONNECTION);
    try {
        await pgConnection.raw("SELECT 1 + 1;");
    }
    catch (error) {
        if (error.code === "3D000") {
            logger_1.logger.error(`Cannot sync links. ${error.message.replace("error: ", "")}`);
            logger_1.logger.info(`Run command "db:create" to create the database`);
        }
        else {
            logger_1.logger.error(error);
        }
        process.exit(1);
    }
}
//# sourceMappingURL=index.js.map