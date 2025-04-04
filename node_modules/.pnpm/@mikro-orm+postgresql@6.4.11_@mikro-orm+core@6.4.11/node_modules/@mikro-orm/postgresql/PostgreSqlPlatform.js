"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgreSqlPlatform = void 0;
const pg_1 = require("pg");
const postgres_date_1 = __importDefault(require("postgres-date"));
const postgres_interval_1 = __importDefault(require("postgres-interval"));
const core_1 = require("@mikro-orm/core");
const knex_1 = require("@mikro-orm/knex");
const PostgreSqlSchemaHelper_1 = require("./PostgreSqlSchemaHelper");
const PostgreSqlExceptionConverter_1 = require("./PostgreSqlExceptionConverter");
const FullTextType_1 = require("./types/FullTextType");
class PostgreSqlPlatform extends knex_1.AbstractSqlPlatform {
    schemaHelper = new PostgreSqlSchemaHelper_1.PostgreSqlSchemaHelper(this);
    exceptionConverter = new PostgreSqlExceptionConverter_1.PostgreSqlExceptionConverter();
    setConfig(config) {
        if (config.get('forceUtcTimezone') == null) {
            config.set('forceUtcTimezone', true);
        }
        super.setConfig(config);
    }
    usesReturningStatement() {
        return true;
    }
    usesCascadeStatement() {
        return true;
    }
    supportsNativeEnums() {
        return true;
    }
    supportsCustomPrimaryKeyNames() {
        return true;
    }
    getCurrentTimestampSQL(length) {
        return `current_timestamp(${length})`;
    }
    getDateTimeTypeDeclarationSQL(column) {
        /* istanbul ignore next */
        return 'timestamptz' + (column.length != null ? `(${column.length})` : '');
    }
    getDefaultDateTimeLength() {
        return 6;
    }
    convertIntervalToJSValue(value) {
        return (0, postgres_interval_1.default)(value);
    }
    convertIntervalToDatabaseValue(value) {
        if (core_1.Utils.isObject(value) && 'toPostgres' in value && typeof value.toPostgres === 'function') {
            return value.toPostgres();
        }
        return value;
    }
    getTimeTypeDeclarationSQL() {
        return 'time(0)';
    }
    getIntegerTypeDeclarationSQL(column) {
        if (column.autoincrement && !column.generated) {
            return 'serial';
        }
        return 'int';
    }
    getBigIntTypeDeclarationSQL(column) {
        /* istanbul ignore next */
        if (column.autoincrement) {
            return `bigserial`;
        }
        return 'bigint';
    }
    getTinyIntTypeDeclarationSQL(column) {
        return 'smallint';
    }
    getUuidTypeDeclarationSQL(column) {
        return `uuid`;
    }
    getFullTextWhereClause(prop) {
        if (prop.customType instanceof FullTextType_1.FullTextType) {
            return `:column: @@ plainto_tsquery('${prop.customType.regconfig}', :query)`;
        }
        /* istanbul ignore next */
        if (prop.columnTypes[0] === 'tsvector') {
            return `:column: @@ plainto_tsquery('simple', :query)`;
        }
        return `to_tsvector('simple', :column:) @@ plainto_tsquery('simple', :query)`;
    }
    supportsCreatingFullTextIndex() {
        return true;
    }
    getFullTextIndexExpression(indexName, schemaName, tableName, columns) {
        /* istanbul ignore next */
        const quotedTableName = this.quoteIdentifier(schemaName ? `${schemaName}.${tableName}` : tableName);
        const quotedColumnNames = columns.map(c => this.quoteIdentifier(c.name));
        const quotedIndexName = this.quoteIdentifier(indexName);
        if (columns.length === 1 && columns[0].type === 'tsvector') {
            return `create index ${quotedIndexName} on ${quotedTableName} using gin(${quotedColumnNames[0]})`;
        }
        return `create index ${quotedIndexName} on ${quotedTableName} using gin(to_tsvector('simple', ${quotedColumnNames.join(` || ' ' || `)}))`;
    }
    normalizeColumnType(type, options = {}) {
        const simpleType = this.extractSimpleType(type);
        if (['int', 'int4', 'integer'].includes(simpleType)) {
            return this.getIntegerTypeDeclarationSQL({});
        }
        if (['bigint', 'int8'].includes(simpleType)) {
            return this.getBigIntTypeDeclarationSQL({});
        }
        if (['smallint', 'int2'].includes(simpleType)) {
            return this.getSmallIntTypeDeclarationSQL({});
        }
        if (['boolean', 'bool'].includes(simpleType)) {
            return this.getBooleanTypeDeclarationSQL();
        }
        if (['varchar', 'character varying'].includes(simpleType)) {
            return this.getVarcharTypeDeclarationSQL(options);
        }
        if (['char', 'bpchar'].includes(simpleType)) {
            return this.getCharTypeDeclarationSQL(options);
        }
        if (['decimal', 'numeric'].includes(simpleType)) {
            return this.getDecimalTypeDeclarationSQL(options);
        }
        if (['interval'].includes(simpleType)) {
            return this.getIntervalTypeDeclarationSQL(options);
        }
        return super.normalizeColumnType(type, options);
    }
    getMappedType(type) {
        switch (this.extractSimpleType(type)) {
            case 'tsvector': return core_1.Type.getType(FullTextType_1.FullTextType);
            default: return super.getMappedType(type);
        }
    }
    getRegExpOperator(val, flags) {
        /* istanbul ignore next */
        if ((val instanceof RegExp && val.flags.includes('i')) || flags?.includes('i')) {
            return '~*';
        }
        return '~';
    }
    getRegExpValue(val) {
        /* istanbul ignore else */
        if (val.flags.includes('i')) {
            return { $re: val.source, $flags: val.flags };
        }
        /* istanbul ignore next */
        return { $re: val.source };
    }
    isBigIntProperty(prop) {
        return super.isBigIntProperty(prop) || (['bigserial', 'int8'].includes(prop.columnTypes?.[0]));
    }
    getArrayDeclarationSQL() {
        return 'text[]';
    }
    getFloatDeclarationSQL() {
        return 'real';
    }
    getDoubleDeclarationSQL() {
        return 'double precision';
    }
    getEnumTypeDeclarationSQL(column) {
        /* istanbul ignore next */
        if (column.nativeEnumName) {
            return column.nativeEnumName;
        }
        if (column.items?.every(item => core_1.Utils.isString(item))) {
            return 'text';
        }
        return `smallint`;
    }
    supportsMultipleStatements() {
        return true;
    }
    marshallArray(values) {
        const quote = (v) => v === '' || v.match(/["{},\\]/) ? JSON.stringify(v) : v;
        return `{${values.map(v => quote('' + v)).join(',')}}`;
    }
    unmarshallArray(value) {
        if (value === '{}') {
            return [];
        }
        return value.substring(1, value.length - 1).split(',').map(v => {
            if (v === `""`) {
                return '';
            }
            if (v.match(/"(.*)"/)) {
                return v.substring(1, v.length - 1).replaceAll('\\"', '"');
            }
            return v;
        });
    }
    getVarcharTypeDeclarationSQL(column) {
        if (column.length === -1) {
            return 'varchar';
        }
        return super.getVarcharTypeDeclarationSQL(column);
    }
    getCharTypeDeclarationSQL(column) {
        if (column.length === -1) {
            return 'char';
        }
        return super.getCharTypeDeclarationSQL(column);
    }
    getIntervalTypeDeclarationSQL(column) {
        return 'interval' + (column.length != null ? `(${column.length})` : '');
    }
    getBlobDeclarationSQL() {
        return 'bytea';
    }
    getJsonDeclarationSQL() {
        return 'jsonb';
    }
    getSearchJsonPropertyKey(path, type, aliased, value) {
        const first = path.shift();
        const last = path.pop();
        const root = this.quoteIdentifier(aliased ? `${core_1.ALIAS_REPLACEMENT}.${first}` : first);
        type = typeof type === 'string' ? this.getMappedType(type).runtimeType : String(type);
        const types = {
            number: 'float8',
            bigint: 'int8',
            boolean: 'bool',
        };
        const cast = (key) => (0, core_1.raw)(type in types ? `(${key})::${types[type]}` : key);
        let lastOperator = '->>';
        // force `->` for operator payloads with array values
        if (core_1.Utils.isPlainObject(value) && Object.keys(value).every(key => core_1.Utils.isArrayOperator(key) && Array.isArray(value[key]))) {
            lastOperator = '->';
        }
        if (path.length === 0) {
            return cast(`${root}${lastOperator}'${last}'`);
        }
        return cast(`${root}->${path.map(a => this.quoteValue(a)).join('->')}${lastOperator}'${last}'`);
    }
    getJsonIndexDefinition(index) {
        return index.columnNames
            .map(column => {
            if (!column.includes('.')) {
                return column;
            }
            const path = column.split('.');
            const first = path.shift();
            const last = path.pop();
            if (path.length === 0) {
                return `(${this.quoteIdentifier(first)}->>${this.quoteValue(last)})`;
            }
            return `(${this.quoteIdentifier(first)}->${path.map(c => this.quoteValue(c)).join('->')}->>${this.quoteValue(last)})`;
        });
    }
    quoteIdentifier(id, quote = '"') {
        return `${quote}${id.replace('.', `${quote}.${quote}`)}${quote}`;
    }
    escape(value) {
        if (typeof value === 'string') {
            return pg_1.Client.prototype.escapeLiteral(value);
        }
        if (value instanceof Date) {
            return `'${this.formatDate(value)}'`;
        }
        if (ArrayBuffer.isView(value)) {
            return `E'\\\\x${value.toString('hex')}'`;
        }
        return super.escape(value);
    }
    pad(number, digits) {
        return String(number).padStart(digits, '0');
    }
    /** @internal */
    formatDate(date) {
        if (this.timezone === 'Z') {
            return date.toISOString();
        }
        let offset = -date.getTimezoneOffset();
        let year = date.getFullYear();
        const isBCYear = year < 1;
        /* istanbul ignore next */
        if (isBCYear) {
            year = Math.abs(year) + 1;
        }
        const datePart = `${this.pad(year, 4)}-${this.pad(date.getMonth() + 1, 2)}-${this.pad(date.getDate(), 2)}`;
        const timePart = `${this.pad(date.getHours(), 2)}:${this.pad(date.getMinutes(), 2)}:${this.pad(date.getSeconds(), 2)}.${this.pad(date.getMilliseconds(), 3)}`;
        let ret = `${datePart}T${timePart}`;
        /* istanbul ignore if */
        if (offset < 0) {
            ret += '-';
            offset *= -1;
        }
        else {
            ret += '+';
        }
        ret += this.pad(Math.floor(offset / 60), 2) + ':' + this.pad(offset % 60, 2);
        /* istanbul ignore next */
        if (isBCYear) {
            ret += ' BC';
        }
        return ret;
    }
    indexForeignKeys() {
        return false;
    }
    getDefaultMappedType(type) {
        const normalizedType = this.extractSimpleType(type);
        const map = {
            'int2': 'smallint',
            'smallserial': 'smallint',
            'int': 'integer',
            'int4': 'integer',
            'serial': 'integer',
            'serial4': 'integer',
            'int8': 'bigint',
            'bigserial': 'bigint',
            'serial8': 'bigint',
            'numeric': 'decimal',
            'bool': 'boolean',
            'real': 'float',
            'float4': 'float',
            'float8': 'double',
            'timestamp': 'datetime',
            'timestamptz': 'datetime',
            'bytea': 'blob',
            'jsonb': 'json',
            'character varying': 'varchar',
            'bpchar': 'character',
        };
        return super.getDefaultMappedType(map[normalizedType] ?? type);
    }
    supportsSchemas() {
        return true;
    }
    getDefaultSchemaName() {
        return 'public';
    }
    /**
     * Returns the default name of index for the given columns
     * cannot go past 63 character length for identifiers in MySQL
     */
    getIndexName(tableName, columns, type) {
        const indexName = super.getIndexName(tableName, columns, type);
        if (indexName.length > 63) {
            return `${indexName.substring(0, 55 - type.length)}_${core_1.Utils.hash(indexName, 5)}_${type}`;
        }
        return indexName;
    }
    getDefaultPrimaryName(tableName, columns) {
        const indexName = `${tableName}_pkey`;
        if (indexName.length > 63) {
            return `${indexName.substring(0, 55 - 'primary'.length)}_${core_1.Utils.hash(indexName, 5)}_primary`;
        }
        return indexName;
    }
    /**
     * @inheritDoc
     */
    castColumn(prop) {
        switch (prop?.columnTypes?.[0]) {
            case this.getUuidTypeDeclarationSQL({}): return '::text';
            case this.getBooleanTypeDeclarationSQL(): return '::int';
            default: return '';
        }
    }
    /**
     * @inheritDoc
     */
    parseDate(value) {
        // postgres-date returns `null` for a JS ISO string which has the `T` separator
        if (typeof value === 'string' && value.charAt(10) === 'T') {
            return new Date(value);
        }
        /* istanbul ignore next */
        if (typeof value === 'number') {
            return new Date(value);
        }
        const parsed = (0, postgres_date_1.default)(value);
        /* istanbul ignore next */
        if (parsed === null) {
            return value;
        }
        return parsed;
    }
}
exports.PostgreSqlPlatform = PostgreSqlPlatform;
