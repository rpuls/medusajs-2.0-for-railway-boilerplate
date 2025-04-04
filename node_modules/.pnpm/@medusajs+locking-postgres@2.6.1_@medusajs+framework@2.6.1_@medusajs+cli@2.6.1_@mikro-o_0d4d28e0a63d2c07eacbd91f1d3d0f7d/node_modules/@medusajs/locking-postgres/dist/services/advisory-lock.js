"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresAdvisoryLockProvider = void 0;
const utils_1 = require("@medusajs/framework/utils");
const _models_1 = require("../models");
class PostgresAdvisoryLockProvider extends (0, utils_1.MedusaService)({ Locking: _models_1.Locking }) {
    constructor(container) {
        // @ts-ignore
        super(...arguments);
        this.manager = container.manager;
    }
    getManager() {
        return this.manager;
    }
    async execute(keys, job, args) {
        const timeout = Math.max(args?.timeout ?? 5, 1);
        const timeoutSeconds = Number.isNaN(timeout) ? 1 : timeout;
        return await this.getManager().transactional(async (manager) => {
            const ops = [];
            if (timeoutSeconds > 0) {
                ops.push(this.getTimeout(timeoutSeconds));
            }
            const fnName = "pg_advisory_xact_lock";
            const allKeys = Array.isArray(keys) ? keys : [keys];
            const numKeys = allKeys.map(this.hashStringToInt);
            const lockPromises = numKeys.map((numKey) => manager.execute(`SELECT ${fnName}(?)`, [numKey]));
            const lock = Promise.all(lockPromises);
            ops.push(lock);
            try {
                await Promise.race(ops);
                const ret = await job();
                await manager.commit();
                return ret;
            }
            catch (e) {
                await manager.rollback();
                throw e;
            }
        });
    }
    async loadLock(key) {
        const [row] = await this.getManager().execute(`SELECT owner_id, expiration, NOW() AS now FROM locking WHERE id = ?`, [key]);
        return row;
    }
    async acquire(keys, args) {
        keys = Array.isArray(keys) ? keys : [keys];
        const { ownerId, expire } = args ?? {};
        for (const key of keys) {
            const row = await this.loadLock(key);
            if (!row) {
                const expireSql = expire
                    ? `NOW() + INTERVAL '${+expire} SECONDS'`
                    : "NULL";
                try {
                    await this.getManager().execute(`INSERT INTO locking (id, owner_id, expiration) VALUES (?, ?, ${expireSql})`, [key, ownerId ?? null]);
                }
                catch (err) {
                    if (err.toString().includes("locking_pkey")) {
                        const owner = await this.loadLock(key);
                        if (ownerId != owner.owner_id) {
                            throw new Error(`"${key}" is already locked.`);
                        }
                    }
                    else {
                        throw err;
                    }
                }
                continue;
            }
            const errMessage = `Failed to acquire lock for key "${key}"`;
            if (row.owner_id === null || row.owner_id !== ownerId) {
                throw new Error(errMessage);
            }
            if (!row.expiration && row.owner_id == ownerId) {
                continue;
            }
            const canRefresh = row.owner_id == ownerId && (expire || row.expiration <= row.now);
            if (!canRefresh || !expire) {
                continue;
            }
            await this.getManager().execute(`UPDATE locking SET owner_id = ?, expiration = NOW() + INTERVAL '${+expire} SECONDS' WHERE id = ?`, [ownerId ?? null, key]);
        }
    }
    async release(keys, args) {
        const { ownerId } = args ?? {};
        keys = Array.isArray(keys) ? keys : [keys];
        let success = true;
        for (const key of keys) {
            const row = await this.loadLock(key);
            if (!row || row.owner_id != ownerId) {
                success = false;
                continue;
            }
            await this.getManager().execute(`DELETE FROM locking WHERE id = ?`, [key]);
            success = success && (!row.expiration || row.expiration > row.now);
        }
        return success;
    }
    async releaseAll(args) {
        const { ownerId } = args ?? {};
        if (!(0, utils_1.isDefined)(ownerId)) {
            await this.getManager().execute(`TRUNCATE TABLE locking`);
        }
        else {
            await this.getManager().execute(`DELETE FROM locking WHERE owner_id = ?`, [ownerId]);
        }
    }
    hashStringToInt(str) {
        let hash = 5381;
        for (let i = str.length; i--;) {
            hash = (hash * 33) ^ str.charCodeAt(i);
        }
        return hash >>> 0;
    }
    async getTimeout(seconds) {
        return new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error("Timed-out acquiring lock."));
            }, seconds * 1000);
        });
    }
}
exports.PostgresAdvisoryLockProvider = PostgresAdvisoryLockProvider;
PostgresAdvisoryLockProvider.identifier = "locking-postgres";
//# sourceMappingURL=advisory-lock.js.map