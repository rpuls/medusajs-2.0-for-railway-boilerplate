"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractNamingStrategy = void 0;
const enums_1 = require("../enums");
const populatePathMembers = Object.values(enums_1.PopulatePath);
class AbstractNamingStrategy {
    getClassName(file, separator = '-') {
        const name = file.split('.')[0];
        const ret = name.replace(new RegExp(`(?:${separator})+(\\w)`, 'ug'), (_, p1) => p1.toUpperCase());
        return ret.charAt(0).toUpperCase() + ret.slice(1);
    }
    classToMigrationName(timestamp, customMigrationName) {
        let migrationName = `Migration${timestamp}`;
        if (customMigrationName) {
            migrationName += `_${customMigrationName}`;
        }
        return migrationName;
    }
    indexName(tableName, columns, type) {
        /* istanbul ignore next */
        if (tableName.includes('.')) {
            tableName = tableName.substring(tableName.indexOf('.') + 1);
        }
        if (type === 'primary') {
            return `${tableName}_pkey`;
        }
        columns = columns.map(col => col.replace(/\./g, '_'));
        if (type === 'sequence') {
            return `${tableName}_${columns.join('_')}_seq`;
        }
        if (columns.length > 0) {
            return `${tableName}_${columns.join('_')}_${type}`;
        }
        return `${tableName}_${type}`;
    }
    /**
     * @inheritDoc
     */
    getEntityName(tableName, schemaName) {
        const name = tableName.match(/^[^$_\p{ID_Start}]/u) ? `E_${tableName}` : tableName;
        return this.getClassName(name.replaceAll(/[^\u200C\u200D\p{ID_Continue}]+/ug, r => r.split('').map(c => `$${c.codePointAt(0)}`).join('')), '_');
    }
    columnNameToProperty(columnName) {
        const propName = columnName.replace(/[_\- ]+(\w)/ug, (_, p1) => p1.toUpperCase());
        if (populatePathMembers.includes(propName.replace(/^\${2,}/u, '$$').replace(/^\$\*$/u, '*'))) {
            return `$${propName}`;
        }
        return propName;
    }
    /**
     * @inheritDoc
     */
    getEnumClassName(columnName, tableName, schemaName) {
        return this.getEntityName(`${tableName}_${columnName}`, schemaName);
    }
    /**
     * @inheritDoc
     */
    enumValueToEnumProperty(enumValue, columnName, tableName, schemaName) {
        return enumValue.toUpperCase();
    }
    aliasName(entityName, index) {
        // Take only the first letter of the prefix to keep character counts down since some engines have character limits
        return entityName.charAt(0).toLowerCase() + index;
    }
    /**
     * @inheritDoc
     */
    inverseSideName(entityName, propertyName, kind) {
        if (kind === 'm:n') {
            return propertyName + 'Inverse';
        }
        const suffix = kind === '1:m' && !entityName.endsWith('Collection') ? 'Collection' : '';
        if (entityName.length === 1) {
            return entityName[0].toLowerCase() + suffix;
        }
        return entityName[0].toLowerCase() + entityName.substring(1) + suffix;
    }
}
exports.AbstractNamingStrategy = AbstractNamingStrategy;
