"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PivotCollectionPersister = void 0;
const core_1 = require("@mikro-orm/core");
class InsertStatement {
    keys;
    data;
    order;
    constructor(keys, data, order) {
        this.keys = keys;
        this.data = data;
        this.order = order;
    }
    getHash() {
        return JSON.stringify(this.data);
    }
    getData() {
        const data = {};
        this.keys.forEach((key, idx) => data[key] = this.data[idx]);
        return data;
    }
}
class DeleteStatement {
    keys;
    cond;
    constructor(keys, cond) {
        this.keys = keys;
        this.cond = cond;
    }
    getHash() {
        return JSON.stringify(this.cond);
    }
    getCondition() {
        const cond = {};
        this.keys.forEach((key, idx) => cond[key] = this.cond[idx]);
        return cond;
    }
}
class PivotCollectionPersister {
    meta;
    driver;
    ctx;
    schema;
    platform;
    inserts = new Map();
    deletes = new Map();
    batchSize;
    order = 0;
    constructor(meta, driver, ctx, schema) {
        this.meta = meta;
        this.driver = driver;
        this.ctx = ctx;
        this.schema = schema;
        this.platform = this.driver.getPlatform();
        this.batchSize = this.driver.config.get('batchSize');
    }
    enqueueUpdate(prop, insertDiff, deleteDiff, pks) {
        if (insertDiff.length) {
            this.enqueueInsert(prop, insertDiff, pks);
        }
        if (deleteDiff === true || (Array.isArray(deleteDiff) && deleteDiff.length)) {
            this.enqueueDelete(prop, deleteDiff, pks);
        }
    }
    enqueueInsert(prop, insertDiff, pks) {
        for (const fks of insertDiff) {
            const data = prop.owner ? [...fks, ...pks] : [...pks, ...fks];
            const keys = prop.owner
                ? [...prop.inverseJoinColumns, ...prop.joinColumns]
                : [...prop.joinColumns, ...prop.inverseJoinColumns];
            const statement = new InsertStatement(keys, data, this.order++);
            const hash = statement.getHash();
            if (prop.owner || !this.inserts.has(hash)) {
                this.inserts.set(hash, statement);
            }
        }
    }
    enqueueDelete(prop, deleteDiff, pks) {
        if (deleteDiff === true) {
            const statement = new DeleteStatement(prop.joinColumns, pks);
            this.deletes.set(statement.getHash(), statement);
            return;
        }
        for (const fks of deleteDiff) {
            const data = prop.owner ? [...fks, ...pks] : [...pks, ...fks];
            const keys = prop.owner
                ? [...prop.inverseJoinColumns, ...prop.joinColumns]
                : [...prop.joinColumns, ...prop.inverseJoinColumns];
            const statement = new DeleteStatement(keys, data);
            this.deletes.set(statement.getHash(), statement);
        }
    }
    async execute() {
        if (this.deletes.size > 0) {
            const deletes = [...this.deletes.values()];
            for (let i = 0; i < deletes.length; i += this.batchSize) {
                const chunk = deletes.slice(i, i + this.batchSize);
                const cond = { $or: [] };
                for (const item of chunk) {
                    cond.$or.push(item.getCondition());
                }
                await this.driver.nativeDelete(this.meta.className, cond, {
                    ctx: this.ctx,
                    schema: this.schema,
                });
            }
        }
        if (this.inserts.size === 0) {
            return;
        }
        let items = [];
        for (const insert of this.inserts.values()) {
            items[insert.order] = insert.getData();
        }
        items = items.filter(i => i);
        /* istanbul ignore else */
        if (this.platform.allowsMultiInsert()) {
            for (let i = 0; i < items.length; i += this.batchSize) {
                const chunk = items.slice(i, i + this.batchSize);
                await this.driver.nativeInsertMany(this.meta.className, chunk, {
                    ctx: this.ctx,
                    schema: this.schema,
                    convertCustomTypes: false,
                    processCollections: false,
                });
            }
        }
        else {
            await core_1.Utils.runSerial(items, item => {
                return this.driver.createQueryBuilder(this.meta.className, this.ctx, 'write')
                    .withSchema(this.schema)
                    .insert(item)
                    .execute('run', false);
            });
        }
    }
}
exports.PivotCollectionPersister = PivotCollectionPersister;
