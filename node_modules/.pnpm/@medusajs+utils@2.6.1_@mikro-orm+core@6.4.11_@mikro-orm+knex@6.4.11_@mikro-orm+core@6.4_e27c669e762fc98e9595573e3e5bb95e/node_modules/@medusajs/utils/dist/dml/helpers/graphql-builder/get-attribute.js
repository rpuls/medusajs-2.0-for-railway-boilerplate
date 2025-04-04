"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGraphQLAttributeFromDMLPropety = getGraphQLAttributeFromDMLPropety;
const common_1 = require("../../../common");
const primary_key_1 = require("../../properties/primary-key");
/*
 * Map of DML data types to GraphQL types
 */
const GRAPHQL_TYPES = {
    boolean: "Boolean",
    dateTime: "DateTime",
    number: "Int",
    bigNumber: "String",
    text: "String",
    json: "JSON",
    array: "[String]",
    id: "ID",
};
/**
 * Defines a DML entity schema field as a Mikro ORM property
 */
function getGraphQLAttributeFromDMLPropety(modelName, propertyName, property) {
    const field = property.parse(propertyName);
    const fieldType = primary_key_1.PrimaryKeyModifier.isPrimaryKeyModifier(property)
        ? "id"
        : field.dataType.name;
    let enumSchema;
    let gqlAttr;
    const specialType = {
        enum: () => {
            const enumName = (0, common_1.toPascalCase)(modelName + "_" + field.fieldName + "Enum");
            const enumValues = field.dataType
                .options.choices.map((value) => {
                const enumValue = value.replace(/[^a-z0-9_]/gi, "_").toUpperCase();
                return `  ${enumValue}`;
            })
                .join("\n");
            enumSchema = `enum ${enumName} {\n${enumValues}\n}`;
            gqlAttr = {
                property: field.fieldName,
                type: enumName,
            };
        },
        id: () => {
            gqlAttr = {
                property: field.fieldName,
                type: GRAPHQL_TYPES.id,
            };
        },
    };
    if (specialType[fieldType]) {
        specialType[fieldType]();
    }
    else {
        gqlAttr = {
            property: field.fieldName,
            type: GRAPHQL_TYPES[fieldType] ?? "String",
        };
    }
    if (!field.nullable) {
        gqlAttr.type += "!";
    }
    return {
        enum: enumSchema,
        attribute: `${gqlAttr.property}: ${gqlAttr.type}`,
    };
}
//# sourceMappingURL=get-attribute.js.map