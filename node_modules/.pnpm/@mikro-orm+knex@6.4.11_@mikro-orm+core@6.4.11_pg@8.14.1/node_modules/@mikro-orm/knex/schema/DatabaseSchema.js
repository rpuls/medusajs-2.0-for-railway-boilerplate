"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseSchema = void 0;
const core_1 = require("@mikro-orm/core");
const DatabaseTable_1 = require("./DatabaseTable");
/**
 * @internal
 */
class DatabaseSchema {
    platform;
    name;
    tables = [];
    namespaces = new Set();
    nativeEnums = {}; // for postgres
    constructor(platform, name) {
        this.platform = platform;
        this.name = name;
    }
    addTable(name, schema, comment) {
        const namespaceName = schema ?? this.name;
        const table = new DatabaseTable_1.DatabaseTable(this.platform, name, namespaceName);
        table.nativeEnums = this.nativeEnums;
        table.comment = comment;
        this.tables.push(table);
        if (namespaceName != null) {
            this.namespaces.add(namespaceName);
        }
        return table;
    }
    getTables() {
        return this.tables;
    }
    getTable(name) {
        return this.tables.find(t => t.name === name || `${t.schema}.${t.name}` === name);
    }
    hasTable(name) {
        return !!this.getTable(name);
    }
    setNativeEnums(nativeEnums) {
        this.nativeEnums = nativeEnums;
        for (const nativeEnum of Object.values(nativeEnums)) {
            if (nativeEnum.schema && nativeEnum.schema !== '*') {
                this.namespaces.add(nativeEnum.schema);
            }
        }
    }
    getNativeEnums() {
        return this.nativeEnums;
    }
    getNativeEnum(name) {
        return this.nativeEnums[name];
    }
    hasNamespace(namespace) {
        return this.namespaces.has(namespace);
    }
    hasNativeEnum(name) {
        return name in this.nativeEnums;
    }
    getNamespaces() {
        return [...this.namespaces];
    }
    static async create(connection, platform, config, schemaName, schemas, takeTables, skipTables) {
        const schema = new DatabaseSchema(platform, schemaName ?? config.get('schema') ?? platform.getDefaultSchemaName());
        const allTables = await connection.execute(platform.getSchemaHelper().getListTablesSQL());
        const parts = config.get('migrations').tableName.split('.');
        const migrationsTableName = parts[1] ?? parts[0];
        const migrationsSchemaName = parts.length > 1 ? parts[0] : config.get('schema', platform.getDefaultSchemaName());
        const tables = allTables.filter(t => this.isTableNameAllowed(t.table_name, takeTables, skipTables) && (t.table_name !== migrationsTableName || (t.schema_name && t.schema_name !== migrationsSchemaName)));
        await platform.getSchemaHelper().loadInformationSchema(schema, connection, tables, schemas && schemas.length > 0 ? schemas : undefined);
        return schema;
    }
    static fromMetadata(metadata, platform, config, schemaName) {
        const schema = new DatabaseSchema(platform, schemaName ?? config.get('schema'));
        const nativeEnums = {};
        for (const meta of metadata) {
            for (const prop of meta.props) {
                if (prop.nativeEnumName) {
                    let key = prop.nativeEnumName;
                    let enumName = prop.nativeEnumName;
                    let enumSchema = meta.schema ?? schema.name;
                    if (key.includes('.')) {
                        const [explicitSchema, ...parts] = prop.nativeEnumName.split('.');
                        enumName = parts.join('.');
                        key = enumName;
                        enumSchema = explicitSchema;
                    }
                    if (enumSchema && enumSchema !== '*' && enumSchema !== platform.getDefaultSchemaName()) {
                        key = enumSchema + '.' + key;
                    }
                    nativeEnums[key] = {
                        name: enumName,
                        schema: enumSchema,
                        items: prop.items?.map(val => '' + val) ?? [],
                    };
                }
            }
        }
        schema.setNativeEnums(nativeEnums);
        for (const meta of metadata) {
            const table = schema.addTable(meta.collection, this.getSchemaName(meta, config, schemaName));
            table.comment = meta.comment;
            meta.props
                .filter(prop => this.shouldHaveColumn(meta, prop))
                .forEach(prop => table.addColumnFromProperty(prop, meta, config));
            meta.indexes.forEach(index => table.addIndex(meta, index, 'index'));
            meta.uniques.forEach(index => table.addIndex(meta, index, 'unique'));
            table.addIndex(meta, { properties: meta.props.filter(prop => prop.primary).map(prop => prop.name) }, 'primary');
            meta.checks.forEach(check => {
                const columnName = check.property ? meta.properties[check.property].fieldNames[0] : undefined;
                table.addCheck({
                    name: check.name,
                    expression: check.expression,
                    definition: `check ((${check.expression}))`,
                    columnName,
                });
            });
        }
        return schema;
    }
    static getSchemaName(meta, config, schema) {
        return (meta.schema === '*' ? schema : meta.schema) ?? config.get('schema');
    }
    static matchName(name, nameToMatch) {
        return typeof nameToMatch === 'string'
            ? name.toLocaleLowerCase() === nameToMatch.toLocaleLowerCase()
            : nameToMatch.test(name);
    }
    static isTableNameAllowed(tableName, takeTables, skipTables) {
        return ((takeTables?.some(tableNameToMatch => this.matchName(tableName, tableNameToMatch)) ?? true) &&
            !(skipTables?.some(tableNameToMatch => this.matchName(tableName, tableNameToMatch)) ?? false));
    }
    static shouldHaveColumn(meta, prop) {
        if (prop.persist === false || (prop.columnTypes?.length ?? 0) === 0) {
            return false;
        }
        if (prop.kind === core_1.ReferenceKind.EMBEDDED && prop.object) {
            return true;
        }
        const getRootProperty = (prop) => prop.embedded ? getRootProperty(meta.properties[prop.embedded[0]]) : prop;
        const rootProp = getRootProperty(prop);
        if (rootProp.kind === core_1.ReferenceKind.EMBEDDED) {
            return prop === rootProp || !rootProp.object;
        }
        return [core_1.ReferenceKind.SCALAR, core_1.ReferenceKind.MANY_TO_ONE].includes(prop.kind) || (prop.kind === core_1.ReferenceKind.ONE_TO_ONE && prop.owner);
    }
    toJSON() {
        const { platform, namespaces, ...rest } = this;
        return { namespaces: [...namespaces], ...rest };
    }
    prune(schema, wildcardSchemaTables) {
        const hasWildcardSchema = wildcardSchemaTables.length > 0;
        this.tables = this.tables.filter(table => {
            return (!schema && !hasWildcardSchema) // no schema specified and we don't have any multi-schema entity
                || table.schema === schema // specified schema matches the table's one
                || (!schema && !wildcardSchemaTables.includes(table.name)); // no schema specified and the table has fixed one provided
        });
        // remove namespaces of ignored tables
        for (const ns of this.namespaces) {
            if (!this.tables.some(t => t.schema === ns) && !Object.values(this.nativeEnums).some(e => e.schema === ns)) {
                this.namespaces.delete(ns);
            }
        }
    }
}
exports.DatabaseSchema = DatabaseSchema;
