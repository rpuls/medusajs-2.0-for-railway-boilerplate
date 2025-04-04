"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setGraphQLRelationship = setGraphQLRelationship;
const entity_1 = require("../../entity");
const relations_1 = require("../../relations");
const many_to_many_1 = require("../../relations/many-to-many");
const entity_builder_1 = require("../entity-builder");
function defineRelationships(modelName, relationship, { relatedModelName }) {
    let extra;
    const fieldName = relationship.name;
    if (relationship.options?.mappedBy && relations_1.HasOne.isHasOne(relationship)) {
        const otherSideFieldName = relationship.options.mappedBy;
        extra = `extend type ${relatedModelName} {\n  ${otherSideFieldName}: ${modelName}!\n}`;
    }
    let isArray = false;
    if (relations_1.HasMany.isHasMany(relationship) ||
        many_to_many_1.ManyToMany.isManyToMany(relationship)) {
        isArray = true;
    }
    return {
        attribute: `${fieldName}: ${isArray ? "[" : ""}${relatedModelName}${isArray ? "]" : ""}` + (relationship.nullable ? "" : "!"),
        extra,
    };
}
function setGraphQLRelationship(entityName, relationship) {
    const relatedEntity = typeof relationship.entity === "function"
        ? relationship.entity()
        : undefined;
    if (!relatedEntity) {
        throw new Error(`Invalid relationship reference for "${entityName}.${relationship.name}". Make sure to define the relationship using a factory function`);
    }
    if (!entity_1.DmlEntity.isDmlEntity(relatedEntity)) {
        throw new Error(`Invalid relationship reference for "${entityName}.${relationship.name}". Make sure to return a DML entity from the relationship callback`);
    }
    const { modelName, tableName, pgSchema } = (0, entity_builder_1.parseEntityName)(relatedEntity);
    const relatedEntityInfo = {
        relatedModelName: modelName,
        relatedTableName: tableName,
        pgSchema,
    };
    return defineRelationships(entityName, relationship, relatedEntityInfo);
}
//# sourceMappingURL=set-relationship.js.map