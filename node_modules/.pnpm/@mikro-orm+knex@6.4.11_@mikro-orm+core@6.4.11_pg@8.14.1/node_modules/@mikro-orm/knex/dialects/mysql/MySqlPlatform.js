"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MySqlPlatform = void 0;
const core_1 = require("@mikro-orm/core");
const MySqlSchemaHelper_1 = require("./MySqlSchemaHelper");
const MySqlExceptionConverter_1 = require("./MySqlExceptionConverter");
const AbstractSqlPlatform_1 = require("../../AbstractSqlPlatform");
class MySqlPlatform extends AbstractSqlPlatform_1.AbstractSqlPlatform {
    schemaHelper = new MySqlSchemaHelper_1.MySqlSchemaHelper(this);
    exceptionConverter = new MySqlExceptionConverter_1.MySqlExceptionConverter();
    ORDER_BY_NULLS_TRANSLATE = {
        [core_1.QueryOrder.asc_nulls_first]: 'is not null',
        [core_1.QueryOrder.asc_nulls_last]: 'is null',
        [core_1.QueryOrder.desc_nulls_first]: 'is not null',
        [core_1.QueryOrder.desc_nulls_last]: 'is null',
    };
    getDefaultCharset() {
        return 'utf8mb4';
    }
    convertJsonToDatabaseValue(value, context) {
        if (context?.mode === 'query') {
            return value;
        }
        return JSON.stringify(value);
    }
    getJsonIndexDefinition(index) {
        return index.columnNames
            .map(column => {
            if (!column.includes('.')) {
                return column;
            }
            const [root, ...path] = column.split('.');
            return `(json_value(${this.quoteIdentifier(root)}, '$.${path.join('.')}' returning ${index.options?.returning ?? 'char(255)'}))`;
        });
    }
    getBooleanTypeDeclarationSQL() {
        return 'tinyint(1)';
    }
    normalizeColumnType(type, options = {}) {
        const simpleType = this.extractSimpleType(type);
        if (['decimal', 'numeric'].includes(simpleType)) {
            return this.getDecimalTypeDeclarationSQL(options);
        }
        return type;
    }
    getDefaultMappedType(type) {
        if (type === 'tinyint(1)') {
            return super.getDefaultMappedType('boolean');
        }
        return super.getDefaultMappedType(type);
    }
    isNumericColumn(mappedType) {
        return super.isNumericColumn(mappedType) || [core_1.DecimalType, core_1.DoubleType].some(t => mappedType instanceof t);
    }
    supportsUnsigned() {
        return true;
    }
    /**
     * Returns the default name of index for the given columns
     * cannot go past 64 character length for identifiers in MySQL
     */
    getIndexName(tableName, columns, type) {
        if (type === 'primary') {
            return this.getDefaultPrimaryName(tableName, columns);
        }
        const indexName = super.getIndexName(tableName, columns, type);
        if (indexName.length > 64) {
            return `${indexName.substring(0, 56 - type.length)}_${core_1.Utils.hash(indexName, 5)}_${type}`;
        }
        return indexName;
    }
    getDefaultPrimaryName(tableName, columns) {
        return 'PRIMARY'; // https://dev.mysql.com/doc/refman/8.0/en/create-table.html#create-table-indexes-keys
    }
    supportsCreatingFullTextIndex() {
        return true;
    }
    getFullTextWhereClause() {
        return `match(:column:) against (:query in boolean mode)`;
    }
    getFullTextIndexExpression(indexName, schemaName, tableName, columns) {
        /* istanbul ignore next */
        const quotedTableName = this.quoteIdentifier(schemaName ? `${schemaName}.${tableName}` : tableName);
        const quotedColumnNames = columns.map(c => this.quoteIdentifier(c.name));
        const quotedIndexName = this.quoteIdentifier(indexName);
        return `alter table ${quotedTableName} add fulltext index ${quotedIndexName}(${quotedColumnNames.join(',')})`;
    }
    getOrderByExpression(column, direction) {
        const ret = [];
        const dir = direction.toLowerCase();
        if (dir in this.ORDER_BY_NULLS_TRANSLATE) {
            ret.push(`${column} ${this.ORDER_BY_NULLS_TRANSLATE[dir]}`);
        }
        ret.push(`${column} ${dir.replace(/(\s|nulls|first|last)*/gi, '')}`);
        return ret;
    }
}
exports.MySqlPlatform = MySqlPlatform;
