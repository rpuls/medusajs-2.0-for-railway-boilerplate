"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractSqlPlatform = void 0;
const sqlstring_1 = require("sqlstring");
const core_1 = require("@mikro-orm/core");
const SqlEntityRepository_1 = require("./SqlEntityRepository");
const schema_1 = require("./schema");
class AbstractSqlPlatform extends core_1.Platform {
    schemaHelper;
    usesPivotTable() {
        return true;
    }
    indexForeignKeys() {
        return true;
    }
    getRepositoryClass() {
        return SqlEntityRepository_1.SqlEntityRepository;
    }
    getSchemaHelper() {
        return this.schemaHelper;
    }
    /** @inheritDoc */
    lookupExtensions(orm) {
        schema_1.SqlSchemaGenerator.register(orm);
    }
    /* istanbul ignore next: kept for type inference only */
    getSchemaGenerator(driver, em) {
        return new schema_1.SqlSchemaGenerator(em ?? driver);
    }
    quoteValue(value) {
        if (core_1.Utils.isRawSql(value)) {
            return this.formatQuery(value.sql, value.params ?? []);
        }
        if (this.isRaw(value)) {
            return value;
        }
        if (core_1.Utils.isPlainObject(value) || value?.[core_1.JsonProperty]) {
            return this.escape(JSON.stringify(value));
        }
        return this.escape(value);
    }
    escape(value) {
        return (0, sqlstring_1.escape)(value, true, this.timezone);
    }
    getSearchJsonPropertySQL(path, type, aliased) {
        return this.getSearchJsonPropertyKey(path.split('->'), type, aliased);
    }
    getSearchJsonPropertyKey(path, type, aliased, value) {
        const [a, ...b] = path;
        const quoteKey = (key) => key.match(/^[a-z]\w*$/i) ? key : `"${key}"`;
        if (aliased) {
            return (0, core_1.raw)(alias => `json_extract(${this.quoteIdentifier(`${alias}.${a}`)}, '$.${b.map(quoteKey).join('.')}')`);
        }
        return (0, core_1.raw)(`json_extract(${this.quoteIdentifier(a)}, '$.${b.map(quoteKey).join('.')}')`);
    }
    getJsonIndexDefinition(index) {
        return index.columnNames
            .map(column => {
            if (!column.includes('.')) {
                return column;
            }
            const [root, ...path] = column.split('.');
            return `(json_extract(${root}, '$.${path.join('.')}'))`;
        });
    }
    isRaw(value) {
        return super.isRaw(value) || (typeof value === 'object' && value !== null && value.client && ['Ref', 'Raw'].includes(value.constructor.name));
    }
    supportsSchemas() {
        return false;
    }
    /** @inheritDoc */
    generateCustomOrder(escapedColumn, values) {
        let ret = '(case ';
        values.forEach((v, i) => {
            ret += `when ${escapedColumn} = ${this.quoteValue(v)} then ${i} `;
        });
        return ret + 'else null end)';
    }
    /**
     * @internal
     */
    getOrderByExpression(column, direction) {
        return [`${column} ${direction.toLowerCase()}`];
    }
}
exports.AbstractSqlPlatform = AbstractSqlPlatform;
