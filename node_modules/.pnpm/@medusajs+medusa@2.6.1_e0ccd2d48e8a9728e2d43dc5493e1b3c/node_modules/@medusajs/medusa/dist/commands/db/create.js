"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbCreate = dbCreate;
const slugify_1 = __importDefault(require("slugify"));
const path_1 = require("path");
const input_1 = __importDefault(require("@inquirer/input"));
const logger_1 = require("@medusajs/framework/logger");
const utils_1 = require("@medusajs/framework/utils");
async function connectClient(client) {
    try {
        await client.connect();
        return { connected: true, error: null };
    }
    catch (error) {
        return { connected: false, error };
    }
}
/**
 * A low-level utility to create the database. This util should
 * never exit the process implicitly.
 */
async function dbCreate({ db, directory, interactive, }) {
    let dbName = db;
    /**
     * Loading the ".env" file in editor mode so that
     * we can read values from it and update its
     * contents.
     */
    const envEditor = new utils_1.EnvEditor(directory);
    await envEditor.load();
    /**
     * Ensure the "DATABASE_URL" is defined before we attempt to
     * create the database.
     *
     * Also we will discard the database name from the connection
     * string because the mentioned database might not exist
     */
    const dbConnectionString = envEditor.get("DATABASE_URL");
    if (!dbConnectionString) {
        logger_1.logger.error(`Missing "DATABASE_URL" inside the .env file. The value is required to connect to the PostgreSQL server`);
        return false;
    }
    /**
     * Use default value + prompt only when the dbName is not
     * provided via a flag
     */
    if (!dbName) {
        const defaultValue = envEditor.get("DB_NAME") ?? `medusa-${(0, slugify_1.default)((0, path_1.basename)(directory))}`;
        if (interactive) {
            dbName = await (0, input_1.default)({
                message: "Enter the database name",
                default: defaultValue,
                required: true,
            });
        }
        else {
            dbName = defaultValue;
        }
    }
    /**
     * Parse connection string specified as "DATABASE_URL" inside the
     * .env file and create a client instance from it.
     */
    const connectionOptions = (0, utils_1.parseConnectionString)(dbConnectionString);
    /**
     * The following client config is without any database name. This is because
     * we want to connect to the default database (whatever it is) and create
     * a new database that we expect not to exist.
     */
    const clientConfig = {
        host: connectionOptions.host,
        port: connectionOptions.port ? Number(connectionOptions.port) : undefined,
        user: connectionOptions.user,
        password: connectionOptions.password,
        ...(connectionOptions.ssl ? { ssl: connectionOptions.ssl } : {}),
    };
    /**
     * In some case the default database (which is same as the username) does
     * not exist. For example: With Neon, there is no database name after
     * the connection username. Hence, we will have to connect with the
     * postgres database.
     */
    const clientConfigWithPostgresDB = {
        host: connectionOptions.host,
        port: connectionOptions.port ? Number(connectionOptions.port) : undefined,
        user: connectionOptions.user,
        database: "postgres",
        password: connectionOptions.password,
        ...(connectionOptions.ssl ? { ssl: connectionOptions.ssl } : {}),
    };
    /**
     * First connect with the default DB
     */
    let client = (0, utils_1.createClient)(clientConfig);
    let connectionState = await connectClient(client);
    /**
     * In case of an error, connect with the postgres DB
     */
    if (!connectionState.connected) {
        client = (0, utils_1.createClient)(clientConfigWithPostgresDB);
        connectionState = await connectClient(client);
    }
    /**
     * Notify user about the connection state
     */
    if (!connectionState.connected) {
        logger_1.logger.error("Unable to establish database connection because of the following error");
        logger_1.logger.error(connectionState.error);
        return false;
    }
    logger_1.logger.info(`Connection established with the database "${dbName}"`);
    if (await (0, utils_1.dbExists)(client, dbName)) {
        logger_1.logger.info(`Database "${dbName}" already exists`);
        envEditor.set("DB_NAME", dbName, { withEmptyTemplateValue: true });
        await envEditor.save();
        logger_1.logger.info(`Updated .env file with "DB_NAME=${dbName}"`);
        return true;
    }
    await (0, utils_1.createDb)(client, dbName);
    logger_1.logger.info(`Created database "${dbName}"`);
    envEditor.set("DB_NAME", dbName);
    await envEditor.save();
    logger_1.logger.info(`Updated .env file with "DB_NAME=${dbName}"`);
    return true;
}
const main = async function ({ directory, interactive, db }) {
    try {
        const created = await dbCreate({ directory, interactive, db });
        process.exit(created ? 0 : 1);
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
//# sourceMappingURL=create.js.map