"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractSqlConnection = void 0;
const knex_1 = require("knex");
const fs_extra_1 = require("fs-extra");
const core_1 = require("@mikro-orm/core");
const MonkeyPatchable_1 = require("./MonkeyPatchable");
const parentTransactionSymbol = Symbol('parentTransaction');
function isRootTransaction(trx) {
    return !Object.getOwnPropertySymbols(trx).includes(parentTransactionSymbol);
}
class AbstractSqlConnection extends core_1.Connection {
    static __patched = false;
    client;
    constructor(config, options, type) {
        super(config, options, type);
        this.patchKnexClient();
    }
    /** @inheritDoc */
    connect() {
        this.createKnex();
    }
    getKnex() {
        if (!this.client) {
            this.createKnex();
        }
        return this.client;
    }
    /**
     * @inheritDoc
     */
    async close(force) {
        await super.close(force);
        await this.getKnex().destroy();
    }
    /**
     * @inheritDoc
     */
    async isConnected() {
        const check = await this.checkConnection();
        return check.ok;
    }
    /**
     * @inheritDoc
     */
    async checkConnection() {
        try {
            await this.getKnex().raw('select 1');
            return { ok: true };
        }
        catch (error) {
            return { ok: false, reason: error.message, error };
        }
    }
    async transactional(cb, options = {}) {
        const trx = await this.begin(options);
        try {
            const ret = await cb(trx);
            await this.commit(trx, options.eventBroadcaster);
            return ret;
        }
        catch (error) {
            await this.rollback(trx, options.eventBroadcaster);
            throw error;
        }
    }
    async begin(options = {}) {
        if (!options.ctx) {
            await options.eventBroadcaster?.dispatchEvent(core_1.EventType.beforeTransactionStart);
        }
        const trx = await (options.ctx || this.getKnex()).transaction(null, {
            isolationLevel: options.isolationLevel,
            readOnly: options.readOnly,
        });
        if (!options.ctx) {
            await options.eventBroadcaster?.dispatchEvent(core_1.EventType.afterTransactionStart, trx);
        }
        else {
            trx[parentTransactionSymbol] = options.ctx;
        }
        return trx;
    }
    async commit(ctx, eventBroadcaster) {
        const runTrxHooks = isRootTransaction(ctx);
        if (runTrxHooks) {
            await eventBroadcaster?.dispatchEvent(core_1.EventType.beforeTransactionCommit, ctx);
        }
        ctx.commit();
        await ctx.executionPromise; // https://github.com/knex/knex/issues/3847#issuecomment-626330453
        if (runTrxHooks) {
            await eventBroadcaster?.dispatchEvent(core_1.EventType.afterTransactionCommit, ctx);
        }
    }
    async rollback(ctx, eventBroadcaster) {
        const runTrxHooks = isRootTransaction(ctx);
        if (runTrxHooks) {
            await eventBroadcaster?.dispatchEvent(core_1.EventType.beforeTransactionRollback, ctx);
        }
        await ctx.rollback();
        if (runTrxHooks) {
            await eventBroadcaster?.dispatchEvent(core_1.EventType.afterTransactionRollback, ctx);
        }
    }
    async execute(queryOrKnex, params = [], method = 'all', ctx, loggerContext) {
        await this.ensureConnection();
        if (core_1.Utils.isObject(queryOrKnex)) {
            ctx ??= (queryOrKnex.client.transacting ? queryOrKnex : null);
            const q = queryOrKnex.toSQL();
            queryOrKnex = q.sql;
            params = q.bindings;
        }
        queryOrKnex = this.config.get('onQuery')(queryOrKnex, params);
        const formatted = this.platform.formatQuery(queryOrKnex, params);
        const sql = this.getSql(queryOrKnex, formatted, loggerContext);
        return this.executeQuery(sql, async () => {
            const query = this.getKnex().raw(formatted);
            if (ctx) {
                query.transacting(ctx);
            }
            const res = await query;
            return this.transformRawResult(res, method);
        }, { query: queryOrKnex, params, ...loggerContext });
    }
    /**
     * Execute raw SQL queries from file
     */
    async loadFile(path) {
        const buf = await (0, fs_extra_1.readFile)(path);
        try {
            await this.getKnex().raw(buf.toString());
        }
        catch (e) {
            /* istanbul ignore next */
            throw this.platform.getExceptionConverter().convertException(e);
        }
    }
    createKnexClient(type) {
        const driverOptions = this.config.get('driverOptions');
        if (driverOptions.context?.client instanceof knex_1.knex.Client) {
            this.logger.log('info', 'Reusing knex client provided via `driverOptions`');
            return driverOptions;
        }
        return (0, knex_1.knex)(this.getKnexOptions(type))
            .on('query', data => {
            if (!data.__knexQueryUid) {
                this.logQuery(data.sql.toLowerCase().replace(/;$/, ''));
            }
        });
    }
    getKnexOptions(type) {
        const config = core_1.Utils.mergeConfig({
            client: type,
            connection: this.getConnectionOptions(),
            pool: this.config.get('pool'),
        }, this.config.get('driverOptions'), this.options.driverOptions);
        const options = config.connection;
        const password = options.password;
        if (!(password instanceof Function)) {
            return config;
        }
        config.connection = async () => {
            const pw = await password();
            if (typeof pw === 'string') {
                return { ...options, password: pw };
            }
            return {
                ...options,
                password: pw.password,
                expirationChecker: pw.expirationChecker,
            };
        };
        return config;
    }
    getSql(query, formatted, context) {
        const logger = this.config.getLogger();
        if (!logger.isEnabled('query', context)) {
            return query;
        }
        if (logger.isEnabled('query-params', context)) {
            return formatted;
        }
        return this.getKnex().client.positionBindings(query);
    }
    /**
     * do not call `positionBindings` when there are no bindings - it was messing up with
     * already interpolated strings containing `?`, and escaping that was not enough to
     * support edge cases like `\\?` strings (as `positionBindings` was removing the `\\`)
     */
    patchKnexClient() {
        const { Client, TableCompiler } = MonkeyPatchable_1.MonkeyPatchable;
        const query = Client.prototype.query;
        if (AbstractSqlConnection.__patched) {
            return;
        }
        AbstractSqlConnection.__patched = true;
        Client.prototype.query = function (connection, obj) {
            if (typeof obj === 'string') {
                obj = { sql: obj };
            }
            if ((obj.bindings ?? []).length > 0) {
                return query.call(this, connection, obj);
            }
            // eslint-disable-next-line @typescript-eslint/naming-convention
            const { __knexUid, __knexTxId } = connection;
            this.emit('query', Object.assign({ __knexUid, __knexTxId }, obj));
            return MonkeyPatchable_1.MonkeyPatchable.QueryExecutioner.executeQuery(connection, obj, this);
        };
        TableCompiler.prototype.raw = function (query) {
            this.pushQuery(query);
        };
    }
}
exports.AbstractSqlConnection = AbstractSqlConnection;
