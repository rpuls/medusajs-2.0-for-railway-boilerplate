"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Migrator_alreadyLoadedPaths;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migrator = void 0;
const glob_1 = require("glob");
const path_1 = require("path");
const logger_1 = require("../logger");
const utils_1 = require("../utils");
class Migrator {
    constructor({ container }) {
        _Migrator_alreadyLoadedPaths.set(this, new Map());
        this.container = container;
        this.pgConnection = this.container.resolve(utils_1.ContainerRegistrationKeys.PG_CONNECTION);
    }
    /**
     * Util to track duration using hrtime
     */
    trackDuration() {
        const startTime = process.hrtime();
        return {
            getSeconds() {
                const duration = process.hrtime(startTime);
                return (duration[0] + duration[1] / 1e9).toFixed(2);
            },
        };
    }
    async ensureDatabase() {
        const pgConnection = this.container.resolve(utils_1.ContainerRegistrationKeys.PG_CONNECTION);
        try {
            await pgConnection.raw("SELECT 1 + 1;");
        }
        catch (error) {
            if (error.code === "3D000") {
                logger_1.logger.error(`Cannot run migrations. ${error.message.replace("error: ", "")}`);
                logger_1.logger.info(`Run command "db:create" to create the database`);
            }
            else {
                logger_1.logger.error(error);
            }
            throw error;
        }
    }
    async ensureMigrationsTable() {
        try {
            // Check if table exists
            const tableExists = await this.pgConnection.raw(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public'
          AND table_name = '${this.migration_table_name}'
        );
      `);
            if (!tableExists.rows[0].exists) {
                logger_1.logger.info(`Creating migrations table '${this.migration_table_name}'...`);
                await this.createMigrationTable();
                logger_1.logger.info("Migrations table created successfully");
            }
        }
        catch (error) {
            logger_1.logger.error("Failed to ensure migrations table exists:", error);
            throw error;
        }
    }
    async getExecutedMigrations() {
        try {
            const result = await this.pgConnection.raw(`SELECT * FROM ${this.migration_table_name}`);
            return result.rows;
        }
        catch (error) {
            logger_1.logger.error("Failed to get executed migrations:", error);
            throw error;
        }
    }
    async insertMigration(records) {
        try {
            const values = records.map((record) => Object.values(record));
            const columns = Object.keys(records[0]);
            await this.pgConnection.raw(`INSERT INTO ${this.migration_table_name} (${columns.join(", ")}) VALUES ${values
                .map((itemValues) => `(${new Array(itemValues.length).fill("?").join(",")})`)
                .join(",")}`, values.flat());
        }
        catch (error) {
            logger_1.logger.error(`Failed to update migration table '${this.migration_table_name}':`, error);
            throw error;
        }
    }
    /**
     * Load migration files from the given paths
     *
     * @param paths - The paths to load migration files from
     * @param options - The options for loading migration files
     * @param options.force - Whether to force loading migration files even if they have already been loaded
     * @returns The loaded migration file paths
     */
    async loadMigrationFiles(paths, { force } = { force: false }) {
        const allScripts = [];
        for (const basePath of paths) {
            if (!force && __classPrivateFieldGet(this, _Migrator_alreadyLoadedPaths, "f").has(basePath)) {
                allScripts.push(...__classPrivateFieldGet(this, _Migrator_alreadyLoadedPaths, "f").get(basePath));
                continue;
            }
            try {
                const scriptFiles = glob_1.glob.sync("*.{js,ts}", {
                    cwd: basePath,
                    ignore: ["**/index.{js,ts}", "**/*.d.ts"],
                });
                if (!scriptFiles?.length) {
                    continue;
                }
                const filePaths = scriptFiles.map((script) => (0, path_1.join)(basePath, script));
                __classPrivateFieldGet(this, _Migrator_alreadyLoadedPaths, "f").set(basePath, filePaths);
                allScripts.push(...filePaths);
            }
            catch (error) {
                logger_1.logger.error(`Failed to load migration files from ${basePath}:`, error);
                throw error;
            }
        }
        return allScripts;
    }
}
exports.Migrator = Migrator;
_Migrator_alreadyLoadedPaths = new WeakMap();
//# sourceMappingURL=migrator.js.map