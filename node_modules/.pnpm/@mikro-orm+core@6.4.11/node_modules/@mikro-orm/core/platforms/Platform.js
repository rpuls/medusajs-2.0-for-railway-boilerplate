"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Platform = exports.JsonProperty = void 0;
const clone_1 = require("../utils/clone");
const entity_1 = require("../entity");
const naming_strategy_1 = require("../naming-strategy");
const ExceptionConverter_1 = require("./ExceptionConverter");
const types_1 = require("../types");
const Utils_1 = require("../utils/Utils");
const enums_1 = require("../enums");
exports.JsonProperty = Symbol('JsonProperty');
class Platform {
    exceptionConverter = new ExceptionConverter_1.ExceptionConverter();
    config;
    namingStrategy;
    timezone;
    usesPivotTable() {
        return false;
    }
    supportsTransactions() {
        return !this.config.get('disableTransactions');
    }
    usesImplicitTransactions() {
        return true;
    }
    getNamingStrategy() {
        return naming_strategy_1.UnderscoreNamingStrategy;
    }
    usesReturningStatement() {
        return false;
    }
    usesOutputStatement() {
        return false;
    }
    usesCascadeStatement() {
        return false;
    }
    /** for postgres native enums */
    supportsNativeEnums() {
        return false;
    }
    getSchemaHelper() {
        return undefined;
    }
    indexForeignKeys() {
        return false;
    }
    allowsMultiInsert() {
        return true;
    }
    /**
     * Whether or not the driver supports retuning list of created PKs back when multi-inserting
     */
    usesBatchInserts() {
        return true;
    }
    /**
     * Whether or not the driver supports updating many records at once
     */
    usesBatchUpdates() {
        return true;
    }
    usesDefaultKeyword() {
        return true;
    }
    /**
     * Normalizes primary key wrapper to scalar value (e.g. mongodb's ObjectId to string)
     */
    normalizePrimaryKey(data) {
        return data;
    }
    /**
     * Converts scalar primary key representation to native driver wrapper (e.g. string to mongodb's ObjectId)
     */
    denormalizePrimaryKey(data) {
        return data;
    }
    /**
     * Used when serializing via toObject and toJSON methods, allows to use different PK field name (like `id` instead of `_id`)
     */
    getSerializedPrimaryKeyField(field) {
        return field;
    }
    usesDifferentSerializedPrimaryKey() {
        return false;
    }
    /**
     * Returns the SQL specific for the platform to get the current timestamp
     */
    getCurrentTimestampSQL(length) {
        return 'current_timestamp' + (length ? `(${length})` : '');
    }
    getDateTimeTypeDeclarationSQL(column) {
        return 'datetime' + (column.length ? `(${column.length})` : '');
    }
    getDefaultDateTimeLength() {
        return 0;
    }
    getDefaultVarcharLength() {
        return 255;
    }
    getDefaultCharLength() {
        return 1;
    }
    getDateTypeDeclarationSQL(length) {
        return 'date' + (length ? `(${length})` : '');
    }
    getTimeTypeDeclarationSQL(length) {
        return 'time' + (length ? `(${length})` : '');
    }
    getRegExpOperator(val, flags) {
        return 'regexp';
    }
    getRegExpValue(val) {
        if (val.flags.includes('i')) {
            return { $re: `(?i)${val.source}` };
        }
        return { $re: val.source };
    }
    isAllowedTopLevelOperator(operator) {
        return operator === '$not';
    }
    quoteVersionValue(value, prop) {
        return value;
    }
    getDefaultVersionLength() {
        return 3;
    }
    allowsComparingTuples() {
        return true;
    }
    isBigIntProperty(prop) {
        return prop.columnTypes && prop.columnTypes[0] === 'bigint';
    }
    isRaw(value) {
        return typeof value === 'object' && value !== null && '__raw' in value;
    }
    getDefaultSchemaName() {
        return undefined;
    }
    getBooleanTypeDeclarationSQL() {
        return 'boolean';
    }
    getIntegerTypeDeclarationSQL(column) {
        return 'int';
    }
    getSmallIntTypeDeclarationSQL(column) {
        return 'smallint';
    }
    getMediumIntTypeDeclarationSQL(column) {
        return 'mediumint';
    }
    getTinyIntTypeDeclarationSQL(column) {
        return 'tinyint';
    }
    getBigIntTypeDeclarationSQL(column) {
        return 'bigint';
    }
    getCharTypeDeclarationSQL(column) {
        return `char(${column.length ?? this.getDefaultCharLength()})`;
    }
    getVarcharTypeDeclarationSQL(column) {
        return `varchar(${column.length ?? this.getDefaultVarcharLength()})`;
    }
    getIntervalTypeDeclarationSQL(column) {
        return 'interval' + (column.length ? `(${column.length})` : '');
    }
    getTextTypeDeclarationSQL(_column) {
        return `text`;
    }
    getEnumTypeDeclarationSQL(column) {
        if (column.items?.every(item => Utils_1.Utils.isString(item))) {
            return `enum('${column.items.join("','")}')`;
        }
        return this.getTinyIntTypeDeclarationSQL(column);
    }
    getFloatDeclarationSQL() {
        return 'float';
    }
    getDoubleDeclarationSQL() {
        return 'double';
    }
    getDecimalTypeDeclarationSQL(column) {
        const precision = column.precision ?? 10;
        const scale = column.scale ?? 0;
        return `numeric(${precision},${scale})`;
    }
    getUuidTypeDeclarationSQL(column) {
        column.length ??= 36;
        return this.getVarcharTypeDeclarationSQL(column);
    }
    extractSimpleType(type) {
        return type.toLowerCase().match(/[^(), ]+/)[0];
    }
    /**
     * This should be used only to compare types, it can strip some information like the length.
     */
    normalizeColumnType(type, options = {}) {
        return type.toLowerCase();
    }
    getMappedType(type) {
        const mappedType = this.config.get('discovery').getMappedType?.(type, this);
        return mappedType ?? this.getDefaultMappedType(type);
    }
    getDefaultMappedType(type) {
        if (type.endsWith('[]')) {
            return types_1.Type.getType(types_1.ArrayType);
        }
        switch (this.extractSimpleType(type)) {
            case 'character':
            case 'char': return types_1.Type.getType(types_1.CharacterType);
            case 'string':
            case 'varchar': return types_1.Type.getType(types_1.StringType);
            case 'interval': return types_1.Type.getType(types_1.IntervalType);
            case 'text': return types_1.Type.getType(types_1.TextType);
            case 'int':
            case 'number': return types_1.Type.getType(types_1.IntegerType);
            case 'bigint': return types_1.Type.getType(types_1.BigIntType);
            case 'smallint': return types_1.Type.getType(types_1.SmallIntType);
            case 'tinyint': return types_1.Type.getType(types_1.TinyIntType);
            case 'mediumint': return types_1.Type.getType(types_1.MediumIntType);
            case 'float': return types_1.Type.getType(types_1.FloatType);
            case 'double': return types_1.Type.getType(types_1.DoubleType);
            case 'integer': return types_1.Type.getType(types_1.IntegerType);
            case 'decimal':
            case 'numeric': return types_1.Type.getType(types_1.DecimalType);
            case 'boolean': return types_1.Type.getType(types_1.BooleanType);
            case 'blob':
            case 'buffer': return types_1.Type.getType(types_1.BlobType);
            case 'uint8array': return types_1.Type.getType(types_1.Uint8ArrayType);
            case 'uuid': return types_1.Type.getType(types_1.UuidType);
            case 'date': return types_1.Type.getType(types_1.DateType);
            case 'datetime':
            case 'timestamp': return types_1.Type.getType(types_1.DateTimeType);
            case 'time': return types_1.Type.getType(types_1.TimeType);
            case 'object':
            case 'json': return types_1.Type.getType(types_1.JsonType);
            case 'enum': return types_1.Type.getType(types_1.EnumType);
            default: return types_1.Type.getType(types_1.UnknownType);
        }
    }
    supportsMultipleCascadePaths() {
        return true;
    }
    supportsMultipleStatements() {
        return this.config.get('multipleStatements');
    }
    getArrayDeclarationSQL() {
        return 'text';
    }
    marshallArray(values) {
        return values.join(',');
    }
    unmarshallArray(value) {
        if (value === '') {
            return [];
        }
        return value.split(',');
    }
    getBlobDeclarationSQL() {
        return 'blob';
    }
    getJsonDeclarationSQL() {
        return 'json';
    }
    getSearchJsonPropertySQL(path, type, aliased) {
        return path;
    }
    getSearchJsonPropertyKey(path, type, aliased, value) {
        return path.join('.');
    }
    /* istanbul ignore next */
    getJsonIndexDefinition(index) {
        return index.columnNames;
    }
    getFullTextWhereClause(prop) {
        throw new Error('Full text searching is not supported by this driver.');
    }
    supportsCreatingFullTextIndex() {
        return false;
    }
    getFullTextIndexExpression(indexName, schemaName, tableName, columns) {
        throw new Error('Full text searching is not supported by this driver.');
    }
    convertsJsonAutomatically() {
        return true;
    }
    convertJsonToDatabaseValue(value, context) {
        return JSON.stringify(value);
    }
    convertJsonToJSValue(value, prop) {
        const isObjectEmbedded = prop.embedded && prop.object;
        if ((this.convertsJsonAutomatically() || isObjectEmbedded) && ['json', 'jsonb', this.getJsonDeclarationSQL()].includes(prop.columnTypes[0])) {
            return value;
        }
        return (0, Utils_1.parseJsonSafe)(value);
    }
    convertDateToJSValue(value) {
        return value;
    }
    convertIntervalToJSValue(value) {
        return value;
    }
    convertIntervalToDatabaseValue(value) {
        return value;
    }
    parseDate(value) {
        const date = new Date(value);
        /* istanbul ignore next */
        if (isNaN(date.getTime())) {
            return value;
        }
        return date;
    }
    getRepositoryClass() {
        return entity_1.EntityRepository;
    }
    getDefaultCharset() {
        return 'utf8';
    }
    getExceptionConverter() {
        return this.exceptionConverter;
    }
    /**
     * Allows registering extensions of the driver automatically (e.g. `SchemaGenerator` extension in SQL drivers).
     */
    lookupExtensions(orm) {
        // no extensions by default
    }
    /** @internal */
    init(orm) {
        this.lookupExtensions(orm);
    }
    getExtension(extensionName, extensionKey, moduleName, em) {
        const extension = this.config.getExtension(extensionKey);
        if (extension) {
            return extension;
        }
        /* istanbul ignore next */
        const module = Utils_1.Utils.tryRequire({
            module: moduleName,
            warning: `Please install ${moduleName} package.`,
        });
        /* istanbul ignore next */
        if (module) {
            return this.config.getCachedService(module[extensionName], em);
        }
        /* istanbul ignore next */
        throw new Error(`${extensionName} extension not registered.`);
    }
    /* istanbul ignore next: kept for type inference only */
    getSchemaGenerator(driver, em) {
        throw new Error(`${driver.constructor.name} does not support SchemaGenerator`);
    }
    processDateProperty(value) {
        return value;
    }
    quoteIdentifier(id, quote = '`') {
        return `${quote}${id.toString().replace('.', `${quote}.${quote}`)}${quote}`;
    }
    quoteValue(value) {
        return value;
    }
    /* istanbul ignore next */
    escape(value) {
        return value;
    }
    formatQuery(sql, params) {
        if (params.length === 0) {
            return sql;
        }
        // fast string replace without regexps
        let j = 0;
        let pos = 0;
        let ret = '';
        if (sql[0] === '?') {
            if (sql[1] === '?') {
                ret += this.quoteIdentifier(params[j++]);
                pos = 2;
            }
            else {
                ret += this.quoteValue(params[j++]);
                pos = 1;
            }
        }
        while (pos < sql.length) {
            const idx = sql.indexOf('?', pos + 1);
            if (idx === -1) {
                ret += sql.substring(pos, sql.length);
                break;
            }
            if (sql.substring(idx - 1, idx + 1) === '\\?') {
                ret += sql.substring(pos, idx - 1) + '?';
                pos = idx + 1;
            }
            else if (sql.substring(idx, idx + 2) === '??') {
                ret += sql.substring(pos, idx) + this.quoteIdentifier(params[j++]);
                pos = idx + 2;
            }
            else {
                ret += sql.substring(pos, idx) + this.quoteValue(params[j++]);
                pos = idx + 1;
            }
        }
        return ret;
    }
    cloneEmbeddable(data) {
        const copy = (0, clone_1.clone)(data);
        // tag the copy so we know it should be stringified when quoting (so we know how to treat JSON arrays)
        Object.defineProperty(copy, exports.JsonProperty, { enumerable: false, value: true });
        return copy;
    }
    setConfig(config) {
        this.config = config;
        this.namingStrategy = config.getNamingStrategy();
        if (this.config.get('forceUtcTimezone')) {
            this.timezone = 'Z';
        }
        else {
            this.timezone = this.config.get('timezone');
        }
    }
    getConfig() {
        return this.config;
    }
    getTimezone() {
        return this.timezone;
    }
    isNumericProperty(prop, ignoreCustomType = false) {
        const numericMappedType = prop.columnTypes?.[0] && this.isNumericColumn(this.getMappedType(prop.columnTypes[0]));
        return numericMappedType || prop.type === 'number' || this.isBigIntProperty(prop);
    }
    isNumericColumn(mappedType) {
        return [types_1.IntegerType, types_1.SmallIntType, types_1.BigIntType, types_1.TinyIntType].some(t => mappedType instanceof t);
    }
    supportsUnsigned() {
        return false;
    }
    /**
     * Returns the default name of index for the given columns
     */
    getIndexName(tableName, columns, type) {
        return this.namingStrategy.indexName(tableName, columns, type);
    }
    /* istanbul ignore next */
    getDefaultPrimaryName(tableName, columns) {
        return this.namingStrategy.indexName(tableName, columns, 'primary');
    }
    supportsCustomPrimaryKeyNames() {
        return false;
    }
    isPopulated(key, populate) {
        return populate === true || (populate !== false && populate.some(p => p.field === key || p.all));
    }
    shouldHaveColumn(prop, populate, exclude, includeFormulas = true) {
        if (exclude?.includes(prop.name)) {
            return false;
        }
        if (exclude?.find(k => k.startsWith(`${prop.name}.`) && !this.isPopulated(prop.name, populate))) {
            return false;
        }
        if (prop.formula) {
            return includeFormulas && (!prop.lazy || this.isPopulated(prop.name, populate));
        }
        if (prop.persist === false) {
            return false;
        }
        if (prop.lazy && (populate === false || (populate !== true && !populate.some(p => p.field === prop.name)))) {
            return false;
        }
        if ([enums_1.ReferenceKind.SCALAR, enums_1.ReferenceKind.MANY_TO_ONE].includes(prop.kind)) {
            return true;
        }
        if (prop.kind === enums_1.ReferenceKind.EMBEDDED) {
            return !!prop.object;
        }
        return prop.kind === enums_1.ReferenceKind.ONE_TO_ONE && prop.owner;
    }
    /**
     * Currently not supported due to how knex does complex sqlite diffing (always based on current schema)
     */
    supportsDownMigrations() {
        return true;
    }
    validateMetadata(meta) {
        return;
    }
    /**
     * Generates a custom order by statement given a set of in order values, eg.
     * ORDER BY (CASE WHEN priority = 'low' THEN 1 WHEN priority = 'medium' THEN 2 ELSE NULL END)
     */
    generateCustomOrder(escapedColumn, values) {
        throw new Error('Not supported');
    }
    /**
     * @internal
     */
    castColumn(prop) {
        return '';
    }
    /**
     * @internal
     */
    castJsonValue(prop) {
        return '';
    }
    /**
     * @internal
     */
    clone() {
        return this;
    }
}
exports.Platform = Platform;
