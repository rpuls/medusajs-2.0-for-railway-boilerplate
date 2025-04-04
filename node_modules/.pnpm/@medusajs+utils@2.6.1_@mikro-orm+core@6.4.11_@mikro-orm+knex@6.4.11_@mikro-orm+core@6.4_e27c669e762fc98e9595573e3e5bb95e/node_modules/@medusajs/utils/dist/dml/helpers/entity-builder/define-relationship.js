"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineHasOneRelationship = defineHasOneRelationship;
exports.defineHasOneWithFKRelationship = defineHasOneWithFKRelationship;
exports.defineHasManyRelationship = defineHasManyRelationship;
exports.defineBelongsToRelationship = defineBelongsToRelationship;
exports.defineManyToManyRelationship = defineManyToManyRelationship;
exports.defineRelationship = defineRelationship;
const core_1 = require("@mikro-orm/core");
const common_1 = require("../../../common");
const entity_1 = require("../../entity");
const relations_1 = require("../../relations");
const has_many_1 = require("../../relations/has-many");
const has_one_1 = require("../../relations/has-one");
const has_one_fk_1 = require("../../relations/has-one-fk");
const many_to_many_1 = require("../../relations/many-to-many");
const apply_indexes_1 = require("../mikro-orm/apply-indexes");
const parse_entity_name_1 = require("./parse-entity-name");
const relationship_helpers_1 = require("./relationship-helpers");
function retrieveOtherSideRelationshipManyToMany({ relationship, relatedEntity, relatedModelName, entity, }) {
    if (relationship.mappedBy) {
        return [
            relationship.mappedBy,
            relatedEntity.parse().schema[relationship.mappedBy],
        ];
    }
    /**
     * Since we don't have the information about the other side of the
     * relationship, we will try to find all the other side many to many that refers to the current entity.
     * If there is any, we will try to find if at least one of them has a mappedBy.
     */
    const potentialOtherSide = Object.entries(relatedEntity.schema)
        .filter(([, propConfig]) => many_to_many_1.ManyToMany.isManyToMany(propConfig))
        .filter(([prop, propConfig]) => {
        const parsedProp = propConfig.parse(prop);
        const relatedEntity = typeof parsedProp.entity === "function"
            ? parsedProp.entity()
            : undefined;
        if (!relatedEntity) {
            throw new Error(`Invalid relationship reference for "${relatedModelName}.${prop}". Make sure to define the relationship using a factory function`);
        }
        return ((parsedProp.mappedBy === relationship.name &&
            (0, parse_entity_name_1.parseEntityName)(relatedEntity).modelName ===
                (0, parse_entity_name_1.parseEntityName)(entity).modelName) ||
            (0, parse_entity_name_1.parseEntityName)(relatedEntity).modelName ===
                (0, parse_entity_name_1.parseEntityName)(entity).modelName);
    });
    if (potentialOtherSide.length > 1) {
        throw new Error(`Invalid relationship reference for "${entity.name}.${relationship.name}". Make sure to set the mappedBy property on one side or the other or both.`);
    }
    return potentialOtherSide[0] ?? [];
}
/**
 * Validates a many to many relationship without mappedBy and checks if the other side of the relationship is defined and possesses mappedBy.
 * @param MikroORMEntity
 * @param relationship
 * @param relatedEntity
 * @param relatedModelName
 */
function validateManyToManyRelationshipWithoutMappedBy({ MikroORMEntity, relationship, relatedEntity, relatedModelName, entity, }) {
    /**
     * Since we don't have the information about the other side of the
     * relationship, we will try to find all the other side many to many that refers to the current entity.
     * If there is any, we will try to find if at least one of them has a mappedBy.
     */
    const [, potentialOtherSide] = retrieveOtherSideRelationshipManyToMany({
        relationship,
        relatedEntity,
        relatedModelName,
        entity,
    });
    if (!potentialOtherSide) {
        throw new Error(`Invalid relationship reference for "${MikroORMEntity.name}.${relationship.name}". "mappedBy" should be defined on one side or the other.`);
    }
}
/**
 * Defines has one relationship on the Mikro ORM entity.
 */
function defineHasOneRelationship(MikroORMEntity, relationship, relatedEntity, { relatedModelName }, cascades) {
    const shouldRemoveRelated = !!cascades.delete?.includes(relationship.name);
    const { schema: relationSchema } = relatedEntity.parse();
    let mappedBy = (0, common_1.camelToSnakeCase)(MikroORMEntity.name);
    if ("mappedBy" in relationship) {
        mappedBy = relationship.mappedBy;
    }
    const isOthersideBelongsTo = !!mappedBy && relations_1.BelongsTo.isBelongsTo(relationSchema[mappedBy]);
    const oneToOneOptions = {
        entity: relatedModelName,
        ...(relationship.nullable ? { nullable: relationship.nullable } : {}),
        ...(mappedBy ? { mappedBy } : {}),
        deleteRule: shouldRemoveRelated ? "cascade" : undefined,
    };
    if (shouldRemoveRelated && !isOthersideBelongsTo) {
        oneToOneOptions.cascade = ["persist", "soft-remove"];
    }
    (0, core_1.OneToOne)(oneToOneOptions)(MikroORMEntity.prototype, relationship.name);
}
/**
 * Defines has one relationship with Foreign key on the MikroORM
 * entity
 */
function defineHasOneWithFKRelationship(MikroORMEntity, entity, relationship, { relatedModelName }, cascades) {
    const foreignKeyName = (0, relationship_helpers_1.getForeignKey)(relationship);
    const shouldRemoveRelated = !!cascades.delete?.includes(relationship.name);
    let mappedBy = (0, common_1.camelToSnakeCase)(MikroORMEntity.name);
    if ("mappedBy" in relationship) {
        mappedBy = relationship.mappedBy;
    }
    const oneToOneOptions = {
        entity: relatedModelName,
        fieldName: foreignKeyName,
        ...(relationship.nullable ? { nullable: relationship.nullable } : {}),
        ...(mappedBy ? { mappedBy } : {}),
        unique: false,
        //orphanRemoval: true,
    };
    if (shouldRemoveRelated) {
        oneToOneOptions.cascade = ["persist", "soft-remove"];
    }
    (0, core_1.OneToOne)(oneToOneOptions)(MikroORMEntity.prototype, relationship.name);
    (0, core_1.Property)({
        type: "string",
        columnType: "text",
        nullable: relationship.nullable,
        persist: false,
        formula(alias) {
            return alias + "." + foreignKeyName;
        },
    })(MikroORMEntity.prototype, foreignKeyName);
    const hookFactory = function (name, type, hookFn) {
        MikroORMEntity.prototype[name] = function () {
            if (type !== "update") {
                // During creation
                const relationMeta = this.__meta.relations.find((relation) => relation.name === relationship.name).targetMeta;
                this[relationship.name] ??= (0, core_1.rel)(relationMeta.class, this[foreignKeyName]);
                this[foreignKeyName] ??= this[relationship.name]?.id;
                return;
            }
            if (this[relationship.name]) {
                this[foreignKeyName] = this[relationship.name].id;
            }
            if (this[relationship.name] === null) {
                this[foreignKeyName] = null;
            }
            return;
        };
        hookFn()(MikroORMEntity.prototype, name);
    };
    /**
     * Hook to handle foreign key assignation
     */
    hookFactory(`assignRelationFromForeignKeyValue${foreignKeyName}_init`, "init", core_1.OnInit);
    hookFactory(`assignRelationFromForeignKeyValue${foreignKeyName}_create`, "create", core_1.BeforeCreate);
    hookFactory(`assignRelationFromForeignKeyValue${foreignKeyName}_update`, "update", core_1.BeforeUpdate);
}
/**
 * Defines has many relationship on the Mikro ORM entity
 */
function defineHasManyRelationship(MikroORMEntity, relationship, { relatedModelName }, cascades) {
    const shouldRemoveRelated = !!cascades.delete?.includes(relationship.name);
    const options = {
        entity: relatedModelName,
        orphanRemoval: true,
        mappedBy: relationship.mappedBy || (0, common_1.camelToSnakeCase)(MikroORMEntity.name),
    };
    if (shouldRemoveRelated) {
        options.cascade = ["persist", "soft-remove"];
    }
    (0, core_1.OneToMany)(options)(MikroORMEntity.prototype, relationship.name);
}
/**
 * Defines belongs to relationship on the Mikro ORM entity. The belongsTo
 * relationship inspects the related entity for the other side of
 * the relationship and then uses one of the following Mikro ORM
 * relationship.
 *
 * - OneToOne: When the other side uses "hasOne" with "owner: true"
 * - ManyToOne: When the other side uses "hasMany"
 */
function defineBelongsToRelationship(MikroORMEntity, entity, relationship, relatedEntity, { relatedModelName }) {
    const mappedBy = relationship.mappedBy || (0, common_1.camelToSnakeCase)(MikroORMEntity.name);
    const { schema: relationSchema, cascades: relationCascades } = relatedEntity.parse();
    const otherSideRelation = relationSchema[mappedBy];
    /**
     * In DML the relationships are cascaded from parent to child. A belongsTo
     * relationship is always a child, therefore we look at the parent and
     * define a deleteRule: cascade when we are included in the delete
     * list of parent cascade.
     */
    const shouldCascade = !!relationCascades.delete?.includes(mappedBy);
    function applyForeignKeyAssignationHooks(foreignKeyName) {
        const hookFactory = function (name, type, hookFn) {
            MikroORMEntity.prototype[name] = function () {
                /**
                 * In case of has one relation, in order to be able to have both ways
                 * to associate a relation (through the relation or the foreign key) we need to handle it
                 * specifically
                 */
                if (has_one_1.HasOne.isHasOne(otherSideRelation) ||
                    has_one_fk_1.HasOneWithForeignKey.isHasOneWithForeignKey(otherSideRelation)) {
                    if (type !== "update") {
                        // During creation
                        const relationMeta = this.__meta.relations.find((relation) => relation.name === relationship.name).targetMeta;
                        this[relationship.name] ??= (0, core_1.rel)(relationMeta.class, this[foreignKeyName]);
                        this[foreignKeyName] ??= this[relationship.name]?.id;
                        return;
                    }
                    if (this[relationship.name]) {
                        this[foreignKeyName] = this[relationship.name].id;
                    }
                    if (this[relationship.name] === null) {
                        this[foreignKeyName] = null;
                    }
                    return;
                }
                /**
                 * Do not override the existing foreign key value if
                 * exists
                 */
                if (this[foreignKeyName] !== undefined) {
                    return;
                }
                /**
                 * Set the foreign key when the relationship is initialized
                 * as null
                 */
                if (this[relationship.name] === null) {
                    this[foreignKeyName] = null;
                    return;
                }
                /**
                 * Set the foreign key when the relationship is initialized
                 * and as the id
                 */
                if (this[relationship.name] && "id" in this[relationship.name]) {
                    this[foreignKeyName] = this[relationship.name].id;
                }
            };
            hookFn()(MikroORMEntity.prototype, name);
        };
        /**
         * Hook to handle foreign key assignation
         */
        hookFactory(`assignRelationFromForeignKeyValue${foreignKeyName}_init`, "init", core_1.OnInit);
        hookFactory(`assignRelationFromForeignKeyValue${foreignKeyName}_create`, "create", core_1.BeforeCreate);
        hookFactory(`assignRelationFromForeignKeyValue${foreignKeyName}_update`, "update", core_1.BeforeUpdate);
    }
    /**
     * Otherside is a has many. Hence we should defined a ManyToOne
     */
    if (!otherSideRelation ||
        has_many_1.HasMany.isHasMany(otherSideRelation) ||
        many_to_many_1.ManyToMany.isManyToMany(otherSideRelation)) {
        const foreignKeyName = (0, relationship_helpers_1.getForeignKey)(relationship);
        const detachCascade = !!relationship.mappedBy &&
            relationCascades.detach?.includes(relationship.mappedBy);
        if (many_to_many_1.ManyToMany.isManyToMany(otherSideRelation)) {
            (0, core_1.Property)({
                type: "string",
                columnType: "text",
                fieldName: foreignKeyName,
                nullable: relationship.nullable,
            })(MikroORMEntity.prototype, foreignKeyName);
            const conf = {
                entity: relatedModelName,
                nullable: relationship.nullable,
                persist: false,
            };
            if (shouldCascade || detachCascade) {
                conf["deleteRule"] = "cascade";
            }
            (0, core_1.ManyToOne)(conf)(MikroORMEntity.prototype, relationship.name);
        }
        else {
            const conf = {
                entity: relatedModelName,
                columnType: "text",
                mapToPk: true,
                fieldName: foreignKeyName,
                nullable: relationship.nullable,
            };
            if (shouldCascade) {
                conf["deleteRule"] = "cascade";
            }
            (0, core_1.ManyToOne)(conf)(MikroORMEntity.prototype, foreignKeyName);
            (0, core_1.ManyToOne)({
                entity: relatedModelName,
                fieldName: foreignKeyName,
                persist: false,
                nullable: relationship.nullable,
            })(MikroORMEntity.prototype, relationship.name);
        }
        const { tableName } = (0, parse_entity_name_1.parseEntityName)(entity);
        (0, apply_indexes_1.applyEntityIndexes)(MikroORMEntity, tableName, [
            {
                on: [foreignKeyName],
                where: "deleted_at IS NULL",
            },
        ]);
        applyForeignKeyAssignationHooks(foreignKeyName);
        return;
    }
    /**
     * Otherside is a has one. Hence we should defined a OneToOne
     */
    if (has_one_1.HasOne.isHasOne(otherSideRelation) ||
        has_one_fk_1.HasOneWithForeignKey.isHasOneWithForeignKey(otherSideRelation)) {
        const foreignKeyName = (0, relationship_helpers_1.getForeignKey)(relationship);
        (0, core_1.Property)({
            columnType: "text",
            type: "string",
            nullable: relationship.nullable,
            persist: false,
            formula(alias) {
                return alias + "." + foreignKeyName;
            },
        })(MikroORMEntity.prototype, foreignKeyName);
        const oneToOneOptions = {
            entity: relatedModelName,
            nullable: relationship.nullable,
            mappedBy: mappedBy,
            fieldName: foreignKeyName,
            owner: true,
            /**
             * If we decide to support non soft deletable then this should be true and the unique index id should be removed
             */
            unique: false,
            // orphanRemoval: true,
        };
        if (shouldCascade) {
            oneToOneOptions.deleteRule = "cascade";
            oneToOneOptions.cascade = [core_1.Cascade.PERSIST, "soft-remove"];
        }
        (0, core_1.OneToOne)(oneToOneOptions)(MikroORMEntity.prototype, relationship.name);
        const { tableName } = (0, parse_entity_name_1.parseEntityName)(entity);
        (0, apply_indexes_1.applyEntityIndexes)(MikroORMEntity, tableName, [
            {
                on: [foreignKeyName],
                where: "deleted_at IS NULL",
                unique: true,
            },
        ]);
        applyForeignKeyAssignationHooks(foreignKeyName);
        return;
    }
    /**
     * Other side is some unsupported data-type
     */
    throw new Error(`Invalid relationship reference for "${mappedBy}" on "${relatedModelName}" entity. Make sure to define a hasOne or hasMany relationship`);
}
/**
 * Defines a many to many relationship on the Mikro ORM entity
 */
function defineManyToManyRelationship(MikroORMEntity, entity, relationship, relatedEntity, { relatedModelName, pgSchema, }, { MANY_TO_MANY_TRACKED_RELATIONS }) {
    let mappedBy = relationship.mappedBy;
    let inversedBy;
    let pivotEntityName;
    let pivotTableName;
    const joinColumn = !Array.isArray(relationship.options.joinColumn)
        ? relationship.options.joinColumn
        : undefined;
    const joinColumns = Array.isArray(relationship.options.joinColumn)
        ? relationship.options.joinColumn
        : undefined;
    const inverseJoinColumn = !Array.isArray(relationship.options.inverseJoinColumn)
        ? relationship.options.inverseJoinColumn
        : undefined;
    const inverseJoinColumns = Array.isArray(relationship.options.inverseJoinColumn)
        ? relationship.options.inverseJoinColumn
        : undefined;
    const [otherSideRelationshipProperty, otherSideRelationship] = retrieveOtherSideRelationshipManyToMany({
        relationship,
        relatedEntity,
        relatedModelName,
        entity,
    });
    /**
     * Validating other side of relationship when mapped by is defined
     */
    if (mappedBy) {
        if (!otherSideRelationship) {
            throw new Error(`Missing property "${mappedBy}" on "${relatedModelName}" entity. Make sure to define it as a relationship`);
        }
        if (!many_to_many_1.ManyToMany.isManyToMany(otherSideRelationship)) {
            throw new Error(`Invalid relationship reference for "${mappedBy}" on "${relatedModelName}" entity. Make sure to define a manyToMany relationship`);
        }
    }
    else {
        validateManyToManyRelationshipWithoutMappedBy({
            MikroORMEntity,
            relationship,
            relatedEntity,
            relatedModelName,
            entity,
        });
    }
    MANY_TO_MANY_TRACKED_RELATIONS[`${MikroORMEntity.name}.${relationship.name}`] = true;
    /**
     * Validating pivot entity when it is defined and computing
     * its name
     */
    if (relationship.options.pivotEntity) {
        if (typeof relationship.options.pivotEntity !== "function") {
            throw new Error(`Invalid pivotEntity reference for "${MikroORMEntity.name}.${relationship.name}". Make sure to define the pivotEntity using a factory function`);
        }
        const pivotEntity = relationship.options.pivotEntity();
        if (!entity_1.DmlEntity.isDmlEntity(pivotEntity)) {
            throw new Error(`Invalid pivotEntity reference for "${MikroORMEntity.name}.${relationship.name}". Make sure to return a DML entity from the pivotEntity callback`);
        }
        pivotEntityName = (0, parse_entity_name_1.parseEntityName)(pivotEntity).modelName;
    }
    const tableName = (0, parse_entity_name_1.parseEntityName)(entity).tableNameWithoutSchema;
    const relatedTableName = (0, parse_entity_name_1.parseEntityName)(relatedEntity).tableNameWithoutSchema;
    const sortedTableNames = [tableName, relatedTableName].sort();
    const otherSideRelationOptions = otherSideRelationship.parse("").options;
    if (!pivotEntityName) {
        /**
         * Pivot table name is created as follows (when not explicitly provided)
         *
         * - Combining both the entity's names.
         * - Sorting them by alphabetical order
         * - Converting them from camelCase to snake_case.
         * - And finally pluralizing the second entity name.
         */
        pivotTableName =
            relationship.options.pivotTable ??
                otherSideRelationship.parse("").options.pivotTable ??
                sortedTableNames
                    .map((token, index) => {
                    if (index === 1) {
                        return (0, common_1.pluralize)(token);
                    }
                    return token;
                })
                    .join("_");
    }
    let isOwner = undefined;
    const configuresRelationship = !!(joinColumn ||
        joinColumns ||
        inverseJoinColumn ||
        inverseJoinColumns ||
        relationship.options.pivotTable);
    const relatedOneConfiguresRelationship = !!(otherSideRelationOptions.pivotTable ||
        otherSideRelationOptions.joinColumn ||
        otherSideRelationOptions.inverseJoinColumn);
    /**
     * Both sides are configuring the properties that must be on one
     * side only
     */
    if (configuresRelationship && relatedOneConfiguresRelationship) {
        throw new Error(`Invalid relationship reference for "${MikroORMEntity.name}.${relationship.name}". Define "pivotTable", "joinColumn", or "inverseJoinColumn" on only one side of the relationship`);
    }
    /**
     * If any of the following properties are provided, we consider
     * the current side to be the owner
     */
    if (configuresRelationship) {
        isOwner = true;
    }
    /**
     * If any of the properties are provided on the other side,
     * then we do not expect the current side to be the owner
     */
    if (isOwner === undefined && relatedOneConfiguresRelationship) {
        isOwner = false;
    }
    /**
     * Finally, we consider the current side as owner, if it is
     * the first one in alphabetical order. The same logic is
     * applied to pivot table name as well.
     */
    isOwner ??= sortedTableNames[0] === tableName;
    const mappedByProp = isOwner ? "inversedBy" : "mappedBy";
    const mappedByPropValue = mappedBy ?? inversedBy ?? otherSideRelationshipProperty;
    const joinColumnProp = Array.isArray(relationship.options.joinColumn)
        ? "joinColumns"
        : "joinColumn";
    const inverseJoinColumnProp = Array.isArray(relationship.options.inverseJoinColumn)
        ? "inverseJoinColumns"
        : "inverseJoinColumn";
    const manytoManyOptions = {
        owner: isOwner,
        entity: relatedModelName,
        ...(pivotTableName
            ? {
                pivotTable: pgSchema
                    ? `${pgSchema}.${pivotTableName}`
                    : pivotTableName,
            }
            : {}),
        ...(pivotEntityName ? { pivotEntity: pivotEntityName } : {}),
        ...{ [mappedByProp]: mappedByPropValue },
    };
    if (joinColumn || joinColumns) {
        manytoManyOptions[joinColumnProp] = joinColumn ?? joinColumns;
    }
    if (inverseJoinColumn || inverseJoinColumns) {
        manytoManyOptions[inverseJoinColumnProp] =
            inverseJoinColumn ?? inverseJoinColumns;
    }
    (0, core_1.ManyToMany)(manytoManyOptions)(MikroORMEntity.prototype, relationship.name);
}
/**
 * Defines a DML entity schema field as a Mikro ORM relationship
 */
function defineRelationship(MikroORMEntity, entity, relationship, cascades, context) {
    /**
     * We expect the relationship.entity to be a function that
     * lazily returns the related entity
     */
    const relatedEntity = typeof relationship.entity === "function"
        ? relationship.entity()
        : undefined;
    /**
     * Since we don't type-check relationships, we should validate
     * them at runtime
     */
    if (!relatedEntity) {
        throw new Error(`Invalid relationship reference for "${MikroORMEntity.name}.${relationship.name}". Make sure to define the relationship using a factory function`);
    }
    /**
     * Ensure the return value is a DML entity instance
     */
    if (!entity_1.DmlEntity.isDmlEntity(relatedEntity)) {
        throw new Error(`Invalid relationship reference for "${MikroORMEntity.name}.${relationship.name}". Make sure to return a DML entity from the relationship callback`);
    }
    const { modelName, tableName, pgSchema } = (0, parse_entity_name_1.parseEntityName)(relatedEntity);
    const relatedEntityInfo = {
        relatedModelName: modelName,
        relatedTableName: tableName,
        pgSchema,
    };
    /**
     * Defining relationships
     */
    switch (relationship.type) {
        case "hasOne":
            defineHasOneRelationship(MikroORMEntity, relationship, relatedEntity, relatedEntityInfo, cascades);
            break;
        case "hasOneWithFK":
            defineHasOneWithFKRelationship(MikroORMEntity, entity, relationship, relatedEntityInfo, cascades);
            break;
        case "hasMany":
            defineHasManyRelationship(MikroORMEntity, relationship, relatedEntityInfo, cascades);
            break;
        case "belongsTo":
            defineBelongsToRelationship(MikroORMEntity, entity, relationship, relatedEntity, relatedEntityInfo);
            break;
        case "manyToMany":
            defineManyToManyRelationship(MikroORMEntity, entity, relationship, relatedEntity, relatedEntityInfo, context);
            break;
    }
}
//# sourceMappingURL=define-relationship.js.map