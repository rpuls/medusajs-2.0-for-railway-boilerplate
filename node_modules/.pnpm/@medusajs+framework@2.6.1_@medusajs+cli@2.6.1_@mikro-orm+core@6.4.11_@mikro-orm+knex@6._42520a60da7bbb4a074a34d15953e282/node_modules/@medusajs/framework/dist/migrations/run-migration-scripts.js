"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _MigrationScriptsMigrator_instances, _MigrationScriptsMigrator_updateMigrationFinishedAt, _MigrationScriptsMigrator_deleteMigration;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrationScriptsMigrator = void 0;
const utils_1 = require("@medusajs/utils");
const path_1 = require("path");
const logger_1 = require("../logger");
const migrator_1 = require("./migrator");
class MigrationScriptsMigrator extends migrator_1.Migrator {
    constructor({ container }) {
        super({ container });
        _MigrationScriptsMigrator_instances.add(this);
        this.migration_table_name = "script_migrations";
    }
    /**
     * Run the migration scripts
     * @param paths - The paths from which to load the scripts
     */
    async run(paths) {
        const lockService = this.container.resolve(utils_1.Modules.LOCKING);
        const lockKey = "migration-scripts-running";
        await lockService.acquire(lockKey, {
            expire: 60 * 60,
        });
        try {
            const scriptPaths = await this.getPendingMigrations(paths);
            for (const script of scriptPaths) {
                const scriptFn = await (0, utils_1.dynamicImport)(script);
                if (!scriptFn.default) {
                    throw new Error(`Failed to load migration script ${script}. No default export found.`);
                }
                const scriptName = (0, path_1.basename)(script);
                const err = await this.insertMigration([
                    { script_name: scriptName },
                ]).catch((e) => e);
                /**
                 * In case another processes is running in parallel, the migration might
                 * have already been executed and therefore the insert will fail because of the
                 * unique constraint.
                 */
                if (err) {
                    if (err.constraint === "idx_script_name_unique") {
                        continue;
                    }
                    throw err;
                }
                logger_1.logger.info(`Running migration script ${script}`);
                try {
                    const tracker = this.trackDuration();
                    await scriptFn.default({ container: this.container });
                    logger_1.logger.info(`Migration script ${script} completed (${tracker.getSeconds()}s)`);
                    await __classPrivateFieldGet(this, _MigrationScriptsMigrator_instances, "m", _MigrationScriptsMigrator_updateMigrationFinishedAt).call(this, scriptName);
                }
                catch (error) {
                    logger_1.logger.error(`Failed to run migration script ${script}:`, error);
                    await __classPrivateFieldGet(this, _MigrationScriptsMigrator_instances, "m", _MigrationScriptsMigrator_deleteMigration).call(this, scriptName);
                    throw error;
                }
            }
        }
        finally {
            await lockService.release(lockKey);
        }
    }
    async getPendingMigrations(migrationPaths) {
        const executedMigrations = new Set((await this.getExecutedMigrations()).map((item) => item.script_name));
        const all = await this.loadMigrationFiles(migrationPaths);
        return all.filter((item) => !executedMigrations.has((0, path_1.basename)(item)));
    }
    async createMigrationTable() {
        await this.pgConnection.raw(`
      CREATE TABLE IF NOT EXISTS ${this.migration_table_name} (
        id SERIAL PRIMARY KEY,
        script_name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        finished_at TIMESTAMP WITH TIME ZONE
      );

      CREATE UNIQUE INDEX IF NOT EXISTS idx_script_name_unique ON ${this.migration_table_name} (script_name);
    `);
    }
}
exports.MigrationScriptsMigrator = MigrationScriptsMigrator;
_MigrationScriptsMigrator_instances = new WeakSet(), _MigrationScriptsMigrator_updateMigrationFinishedAt = function _MigrationScriptsMigrator_updateMigrationFinishedAt(scriptName) {
    return this.pgConnection.raw(`UPDATE ${this.migration_table_name} SET finished_at = NOW() WHERE script_name = ?`, [scriptName]);
}, _MigrationScriptsMigrator_deleteMigration = function _MigrationScriptsMigrator_deleteMigration(scriptName) {
    return this.pgConnection.raw(`DELETE FROM ${this.migration_table_name} WHERE script_name = ?`, [scriptName]);
};
//# sourceMappingURL=run-migration-scripts.js.map