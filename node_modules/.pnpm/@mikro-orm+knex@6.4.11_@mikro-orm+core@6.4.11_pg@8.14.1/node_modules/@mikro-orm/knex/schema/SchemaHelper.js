"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaHelper = void 0;
const core_1 = require("@mikro-orm/core");
class SchemaHelper {
    platform;
    constructor(platform) {
        this.platform = platform;
    }
    getSchemaBeginning(charset, disableForeignKeys) {
        if (disableForeignKeys) {
            return `${this.disableForeignKeysSQL()}\n`;
        }
        return '';
    }
    disableForeignKeysSQL() {
        return '';
    }
    enableForeignKeysSQL() {
        return '';
    }
    getSchemaEnd(disableForeignKeys) {
        if (disableForeignKeys) {
            return `${this.enableForeignKeysSQL()}\n`;
        }
        return '';
    }
    finalizeTable(table, charset, collate) {
        //
    }
    supportsSchemaConstraints() {
        return true;
    }
    async getPrimaryKeys(connection, indexes = [], tableName, schemaName) {
        const pks = indexes.filter(i => i.primary).map(pk => pk.columnNames);
        return core_1.Utils.flatten(pks);
    }
    inferLengthFromColumnType(type) {
        const match = type.match(/^\w+\s*(?:\(\s*(\d+)\s*\)|$)/);
        if (!match) {
            return;
        }
        return +match[1];
    }
    async getForeignKeys(connection, tableName, schemaName) {
        const fks = await connection.execute(this.getForeignKeysSQL(tableName, schemaName));
        return this.mapForeignKeys(fks, tableName, schemaName);
    }
    getTableKey(t) {
        const unquote = (str) => str.replace(/['"`]/g, '');
        const parts = t.table_name.split('.');
        if (parts.length > 1) {
            return `${unquote(parts[0])}.${unquote(parts[1])}`;
        }
        if (t.schema_name) {
            return `${unquote(t.schema_name)}.${unquote(t.table_name)}`;
        }
        return unquote(t.table_name);
    }
    async getEnumDefinitions(connection, checks, tableName, schemaName) {
        return {};
    }
    getCreateNativeEnumSQL(name, values, schema) {
        throw new Error('Not supported by given driver');
    }
    getDropNativeEnumSQL(name, schema) {
        throw new Error('Not supported by given driver');
    }
    getAlterNativeEnumSQL(name, schema, value, items, oldItems) {
        throw new Error('Not supported by given driver');
    }
    async loadInformationSchema(schema, connection, tables, schemas) {
        for (const t of tables) {
            const table = schema.addTable(t.table_name, t.schema_name, t.table_comment);
            const cols = await this.getColumns(connection, table.name, table.schema);
            const indexes = await this.getIndexes(connection, table.name, table.schema);
            const checks = await this.getChecks(connection, table.name, table.schema, cols);
            const pks = await this.getPrimaryKeys(connection, indexes, table.name, table.schema);
            const fks = await this.getForeignKeys(connection, table.name, table.schema);
            const enums = await this.getEnumDefinitions(connection, checks, table.name, table.schema);
            table.init(cols, indexes, checks, pks, fks, enums);
        }
    }
    getListTablesSQL(schemaName) {
        throw new Error('Not supported by given driver');
    }
    getRenameColumnSQL(tableName, oldColumnName, to, schemaName) {
        tableName = this.platform.quoteIdentifier(tableName);
        oldColumnName = this.platform.quoteIdentifier(oldColumnName);
        const columnName = this.platform.quoteIdentifier(to.name);
        const schemaReference = (schemaName !== undefined && schemaName !== 'public') ? ('"' + schemaName + '".') : '';
        const tableReference = schemaReference + tableName;
        return `alter table ${tableReference} rename column ${oldColumnName} to ${columnName}`;
    }
    getCreateIndexSQL(tableName, index, partialExpression = false) {
        /* istanbul ignore next */
        if (index.expression && !partialExpression) {
            return index.expression;
        }
        tableName = this.platform.quoteIdentifier(tableName);
        const keyName = this.platform.quoteIdentifier(index.keyName);
        const sql = `create ${index.unique ? 'unique ' : ''}index ${keyName} on ${tableName} `;
        if (index.expression && partialExpression) {
            return `${sql}(${index.expression})`;
        }
        return `${sql}(${index.columnNames.map(c => this.platform.quoteIdentifier(c)).join(', ')})`;
    }
    getDropIndexSQL(tableName, index) {
        return `drop index ${this.platform.quoteIdentifier(index.keyName)}`;
    }
    getRenameIndexSQL(tableName, index, oldIndexName) {
        return [this.getDropIndexSQL(tableName, { ...index, keyName: oldIndexName }), this.getCreateIndexSQL(tableName, index)].join(';\n');
    }
    getDropColumnsSQL(tableName, columns, schemaName) {
        const name = this.platform.quoteIdentifier((schemaName && schemaName !== this.platform.getDefaultSchemaName() ? schemaName + '.' : '') + tableName);
        const drops = columns.map(column => `drop column ${this.platform.quoteIdentifier(column.name)}`).join(', ');
        return `alter table ${name} ${drops}`;
    }
    hasNonDefaultPrimaryKeyName(table) {
        const pkIndex = table.getPrimaryKey();
        if (!pkIndex || !this.platform.supportsCustomPrimaryKeyNames()) {
            return false;
        }
        const defaultName = this.platform.getDefaultPrimaryName(table.name, pkIndex.columnNames);
        return pkIndex?.keyName !== defaultName;
    }
    createTableColumn(table, column, fromTable, changedProperties, alter) {
        const compositePK = fromTable.getPrimaryKey()?.composite;
        if (column.autoincrement && !column.generated && !compositePK && (!changedProperties || changedProperties.has('autoincrement') || changedProperties.has('type'))) {
            const primaryKey = !changedProperties && !this.hasNonDefaultPrimaryKeyName(fromTable);
            if (column.mappedType instanceof core_1.BigIntType) {
                return table.bigIncrements(column.name, { primaryKey });
            }
            return table.increments(column.name, { primaryKey });
        }
        if (column.mappedType instanceof core_1.EnumType && column.enumItems?.every(item => core_1.Utils.isString(item))) {
            return table.enum(column.name, column.enumItems);
        }
        let columnType = column.type;
        if (column.generated) {
            columnType += ` generated always as ${column.generated}`;
        }
        return table.specificType(column.name, columnType);
    }
    configureColumn(column, col, knex, changedProperties) {
        const guard = (key) => !changedProperties || changedProperties.has(key);
        core_1.Utils.runIfNotEmpty(() => col.nullable(), column.nullable && guard('nullable'));
        core_1.Utils.runIfNotEmpty(() => col.notNullable(), !column.nullable && !column.generated);
        core_1.Utils.runIfNotEmpty(() => col.unsigned(), column.unsigned);
        core_1.Utils.runIfNotEmpty(() => col.comment(this.processComment(column.comment)), column.comment);
        this.configureColumnDefault(column, col, knex, changedProperties);
        return col;
    }
    configureColumnDefault(column, col, knex, changedProperties) {
        const guard = (key) => !changedProperties || changedProperties.has(key);
        if (changedProperties) {
            core_1.Utils.runIfNotEmpty(() => col.defaultTo(column.default == null ? null : knex.raw(column.default)), guard('default'));
        }
        else {
            core_1.Utils.runIfNotEmpty(() => col.defaultTo(knex.raw(column.default)), column.default != null && column.default !== 'null');
        }
        return col;
    }
    getPreAlterTable(tableDiff, safe) {
        return '';
    }
    getPostAlterTable(tableDiff, safe) {
        return '';
    }
    getAlterColumnAutoincrement(tableName, column, schemaName) {
        return '';
    }
    getChangeColumnCommentSQL(tableName, to, schemaName) {
        return '';
    }
    async getNamespaces(connection) {
        return [];
    }
    async getColumns(connection, tableName, schemaName) {
        throw new Error('Not supported by given driver');
    }
    async getIndexes(connection, tableName, schemaName) {
        throw new Error('Not supported by given driver');
    }
    async getChecks(connection, tableName, schemaName, columns) {
        throw new Error('Not supported by given driver');
    }
    async mapIndexes(indexes) {
        const map = {};
        indexes.forEach(index => {
            if (map[index.keyName]) {
                map[index.keyName].composite = true;
                map[index.keyName].columnNames.push(index.columnNames[0]);
            }
            else {
                map[index.keyName] = index;
            }
        });
        return Object.values(map);
    }
    getForeignKeysSQL(tableName, schemaName) {
        throw new Error('Not supported by given driver');
    }
    mapForeignKeys(fks, tableName, schemaName) {
        return fks.reduce((ret, fk) => {
            if (ret[fk.constraint_name]) {
                ret[fk.constraint_name].columnNames.push(fk.column_name);
                ret[fk.constraint_name].referencedColumnNames.push(fk.referenced_column_name);
            }
            else {
                ret[fk.constraint_name] = {
                    columnNames: [fk.column_name],
                    constraintName: fk.constraint_name,
                    localTableName: schemaName ? `${schemaName}.${tableName}` : tableName,
                    referencedTableName: fk.referenced_schema_name ? `${fk.referenced_schema_name}.${fk.referenced_table_name}` : fk.referenced_table_name,
                    referencedColumnNames: [fk.referenced_column_name],
                    updateRule: fk.update_rule.toLowerCase(),
                    deleteRule: fk.delete_rule.toLowerCase(),
                    deferMode: fk.defer_mode,
                };
            }
            return ret;
        }, {});
    }
    normalizeDefaultValue(defaultValue, length, defaultValues = {}) {
        if (defaultValue == null) {
            return defaultValue;
        }
        const raw = core_1.RawQueryFragment.getKnownFragment(defaultValue);
        if (raw) {
            return this.platform.formatQuery(raw.sql, raw.params);
        }
        const genericValue = defaultValue.replace(/\(\d+\)/, '(?)').toLowerCase();
        const norm = defaultValues[genericValue];
        if (!norm) {
            return defaultValue;
        }
        return norm[0].replace('(?)', length != null ? `(${length})` : '');
    }
    getCreateDatabaseSQL(name) {
        // two line breaks to force separate execution
        return `create database ${name};\n\nuse ${name}`;
    }
    getDropDatabaseSQL(name) {
        return `drop database if exists ${this.platform.quoteIdentifier(name)}`;
    }
    /* istanbul ignore next */
    getCreateNamespaceSQL(name) {
        return `create schema if not exists ${this.platform.quoteIdentifier(name)}`;
    }
    /* istanbul ignore next */
    getDropNamespaceSQL(name) {
        return `drop schema if exists ${this.platform.quoteIdentifier(name)}`;
    }
    getDatabaseExistsSQL(name) {
        return `select 1 from information_schema.schemata where schema_name = '${name}'`;
    }
    getDatabaseNotExistsError(dbName) {
        return `Unknown database '${dbName}'`;
    }
    getManagementDbName() {
        return 'information_schema';
    }
    getDefaultEmptyString() {
        return "''";
    }
    async databaseExists(connection, name) {
        try {
            const res = await connection.execute(this.getDatabaseExistsSQL(name));
            return res.length > 0;
        }
        catch (e) {
            if (e instanceof Error && e.message.includes(this.getDatabaseNotExistsError(name))) {
                return false;
            }
            throw e;
        }
    }
    /**
     * Uses `raw` method injected in `AbstractSqlConnection` to allow adding custom queries inside alter statements.
     */
    pushTableQuery(table, expression, grouping = 'alterTable') {
        table._statements.push({ grouping, method: 'raw', args: [expression] });
    }
    async dump(builder, append) {
        if (typeof builder === 'string') {
            return builder ? builder + (builder.endsWith(';') ? '' : ';') + append : '';
        }
        const sql = await builder.generateDdlCommands();
        const queries = [...sql.pre, ...sql.sql, ...sql.post];
        if (queries.length === 0) {
            return '';
        }
        const dump = `${queries.map(q => typeof q === 'object' ? q.sql : q).join(';\n')};${append}`;
        const tmp = dump.replace(/pragma table_.+/ig, '').replace(/\n\n+/g, '\n').trim();
        return tmp ? tmp + append : '';
    }
    createTable(tableDef, alter) {
        return this.createSchemaBuilder(tableDef.schema).createTable(tableDef.name, table => {
            tableDef.getColumns().forEach(column => {
                const col = this.createTableColumn(table, column, tableDef, undefined, alter);
                this.configureColumn(column, col, this.knex);
            });
            for (const index of tableDef.getIndexes()) {
                const createPrimary = !tableDef.getColumns().some(c => c.autoincrement && c.primary) || this.hasNonDefaultPrimaryKeyName(tableDef);
                this.createIndex(table, index, tableDef, createPrimary);
            }
            for (const check of tableDef.getChecks()) {
                this.createCheck(table, check);
            }
            if (tableDef.comment) {
                const comment = this.platform.quoteValue(tableDef.comment).replace(/^'|'$/g, '');
                table.comment(comment);
            }
            if (!this.supportsSchemaConstraints()) {
                for (const fk of Object.values(tableDef.getForeignKeys())) {
                    this.createForeignKey(table, fk);
                }
            }
            this.finalizeTable(table, this.platform.getConfig().get('charset'), this.platform.getConfig().get('collate'));
        });
    }
    createForeignKey(table, foreignKey, schema) {
        if (!this.options.createForeignKeyConstraints) {
            return;
        }
        const builder = table
            .foreign(foreignKey.columnNames, foreignKey.constraintName)
            .references(foreignKey.referencedColumnNames)
            .inTable(this.getReferencedTableName(foreignKey.referencedTableName, schema))
            .withKeyName(foreignKey.constraintName);
        if (foreignKey.localTableName !== foreignKey.referencedTableName || this.platform.supportsMultipleCascadePaths()) {
            if (foreignKey.updateRule) {
                builder.onUpdate(foreignKey.updateRule);
            }
            if (foreignKey.deleteRule) {
                builder.onDelete(foreignKey.deleteRule);
            }
        }
        if (foreignKey.deferMode) {
            builder.deferrable(foreignKey.deferMode);
        }
    }
    splitTableName(name) {
        const parts = name.split('.');
        const tableName = parts.pop();
        const schemaName = parts.pop();
        return [schemaName, tableName];
    }
    getReferencedTableName(referencedTableName, schema) {
        const [schemaName, tableName] = this.splitTableName(referencedTableName);
        schema = schemaName ?? schema ?? this.platform.getConfig().get('schema');
        /* istanbul ignore next */
        if (schema && schemaName === '*') {
            return `${schema}.${referencedTableName.replace(/^\*\./, '')}`;
        }
        if (!schemaName || schemaName === this.platform.getDefaultSchemaName()) {
            return tableName;
        }
        return `${schemaName}.${tableName}`;
    }
    createIndex(table, index, tableDef, createPrimary = false) {
        if (index.primary && !createPrimary) {
            return;
        }
        if (index.expression) {
            this.pushTableQuery(table, index.expression);
        }
        else if (index.primary) {
            const keyName = this.hasNonDefaultPrimaryKeyName(tableDef) ? index.keyName : undefined;
            table.primary(index.columnNames, keyName);
        }
        else if (index.unique) {
            // JSON columns can have unique index but not unique constraint, and we need to distinguish those, so we can properly drop them
            if (index.columnNames.some(column => column.includes('.'))) {
                const columns = this.platform.getJsonIndexDefinition(index);
                table.index(columns.map(column => this.knex.raw(column)), index.keyName, { indexType: 'unique' });
            }
            else {
                table.unique(index.columnNames, { indexName: index.keyName, deferrable: index.deferMode });
            }
        }
        else if (index.type === 'fulltext') {
            const columns = index.columnNames.map(name => ({ name, type: tableDef.getColumn(name).type }));
            if (this.platform.supportsCreatingFullTextIndex()) {
                this.pushTableQuery(table, this.platform.getFullTextIndexExpression(index.keyName, tableDef.schema, tableDef.name, columns));
            }
        }
        else {
            // JSON columns can have unique index but not unique constraint, and we need to distinguish those, so we can properly drop them
            if (index.columnNames.some(column => column.includes('.'))) {
                const columns = this.platform.getJsonIndexDefinition(index);
                table.index(columns.map(column => this.knex.raw(column)), index.keyName, index.type);
            }
            else {
                table.index(index.columnNames, index.keyName, index.type);
            }
        }
    }
    createCheck(table, check) {
        table.check(check.expression, {}, check.name);
    }
    createSchemaBuilder(schema) {
        const builder = this.knex.schema;
        if (schema && schema !== this.platform.getDefaultSchemaName()) {
            builder.withSchema(schema);
        }
        return builder;
    }
    getTablesGroupedBySchemas(tables) {
        return tables.reduce((acc, table) => {
            const schemaTables = acc.get(table.schema_name);
            if (!schemaTables) {
                acc.set(table.schema_name, [table]);
                return acc;
            }
            schemaTables.push(table);
            return acc;
        }, new Map());
    }
    get knex() {
        const connection = this.platform.getConfig().getDriver().getConnection();
        return connection.getKnex();
    }
    get options() {
        return this.platform.getConfig().get('schemaGenerator');
    }
    processComment(comment) {
        return this.platform.getSchemaHelper().handleMultilineComment(comment);
    }
    handleMultilineComment(comment) {
        return comment.replaceAll('\n', '\\n');
    }
}
exports.SchemaHelper = SchemaHelper;
