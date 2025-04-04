"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseSqlitePlatform = void 0;
const core_1 = require("@mikro-orm/core");
const AbstractSqlPlatform_1 = require("../../AbstractSqlPlatform");
class BaseSqlitePlatform extends AbstractSqlPlatform_1.AbstractSqlPlatform {
    usesDefaultKeyword() {
        return false;
    }
    usesReturningStatement() {
        return true;
    }
    getCurrentTimestampSQL(length) {
        return super.getCurrentTimestampSQL(0);
    }
    getDateTimeTypeDeclarationSQL(column) {
        return 'datetime';
    }
    getEnumTypeDeclarationSQL(column) {
        if (column.items?.every(item => core_1.Utils.isString(item))) {
            return 'text';
        }
        /* istanbul ignore next */
        return this.getTinyIntTypeDeclarationSQL(column);
    }
    getTinyIntTypeDeclarationSQL(column) {
        return this.getIntegerTypeDeclarationSQL(column);
    }
    getSmallIntTypeDeclarationSQL(column) {
        return this.getIntegerTypeDeclarationSQL(column);
    }
    getIntegerTypeDeclarationSQL(column) {
        return 'integer';
    }
    getFloatDeclarationSQL() {
        return 'real';
    }
    getBooleanTypeDeclarationSQL() {
        return 'integer';
    }
    getCharTypeDeclarationSQL(column) {
        return 'text';
    }
    getVarcharTypeDeclarationSQL(column) {
        return 'text';
    }
    normalizeColumnType(type, options = {}) {
        const simpleType = this.extractSimpleType(type);
        if (['varchar', 'text'].includes(simpleType)) {
            return this.getVarcharTypeDeclarationSQL(options);
        }
        return simpleType;
    }
    convertsJsonAutomatically() {
        return false;
    }
    /**
     * This is used to narrow the value of Date properties as they will be stored as timestamps in sqlite.
     * We use this method to convert Dates to timestamps when computing the changeset, so we have the right
     * data type in the payload as well as in original entity data. Without that, we would end up with diffs
     * including all Date properties, as we would be comparing Date object with timestamp.
     */
    processDateProperty(value) {
        if (value instanceof Date) {
            return +value;
        }
        return value;
    }
    getIndexName(tableName, columns, type) {
        if (type === 'primary') {
            return this.getDefaultPrimaryName(tableName, columns);
        }
        return super.getIndexName(tableName, columns, type);
    }
    getDefaultPrimaryName(tableName, columns) {
        return 'primary';
    }
    supportsDownMigrations() {
        return false;
    }
    getFullTextWhereClause() {
        return `:column: match :query`;
    }
    quoteVersionValue(value, prop) {
        if (prop.runtimeType === 'Date') {
            return this.escape(value).replace(/^'|\.\d{3}'$/g, '');
        }
        return value;
    }
    quoteValue(value) {
        if (value instanceof Date) {
            return '' + +value;
        }
        return super.quoteValue(value);
    }
}
exports.BaseSqlitePlatform = BaseSqlitePlatform;
