"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toMikroOrmEntities = exports.toMikroORMEntity = exports.mikroORMEntityBuilder = void 0;
const core_1 = require("@mikro-orm/core");
const dal_1 = require("../../dal");
const entity_1 = require("../entity");
const errors_1 = require("../errors");
const id_1 = require("../properties/id");
const apply_searchable_1 = require("./entity-builder/apply-searchable");
const define_property_1 = require("./entity-builder/define-property");
const define_relationship_1 = require("./entity-builder/define-relationship");
const parse_entity_name_1 = require("./entity-builder/parse-entity-name");
const apply_checks_1 = require("./mikro-orm/apply-checks");
const apply_indexes_1 = require("./mikro-orm/apply-indexes");
/**
 * Factory function to create the mikro orm entity builder. The return
 * value is a function that can be used to convert DML entities
 * to Mikro ORM entities.
 */
function createMikrORMEntity() {
    /**
     * The following property is used to track many to many relationship
     * between two entities. It is needed because we have to mark one
     * of them as the owner of the relationship without exposing
     * any user land APIs to explicitly define an owner.
     *
     * The object contains values as follows.
     * - [modelName.relationship]: true // true means, it is already marked as owner
     *
     * Example:
     * - [user.teams]: true // the teams relationship on user is an owner
     * - [team.users] // cannot be an owner
     */
    let MANY_TO_MANY_TRACKED_RELATIONS = {};
    let ENTITIES = {};
    /**
     * A helper function to define a Mikro ORM entity from a
     * DML entity.
     */
    function createEntity(entity) {
        class MikroORMEntity {
        }
        const { schema, cascades, indexes: entityIndexes = [], 
        //params,
        checks, } = entity.parse();
        const { modelName, tableName } = (0, parse_entity_name_1.parseEntityName)(entity);
        if (ENTITIES[modelName]) {
            return ENTITIES[modelName];
        }
        /**
         * Assigning name to the class constructor, so that it matches
         * the DML entity name
         */
        Object.defineProperty(MikroORMEntity, "name", {
            get: function () {
                return modelName;
            },
        });
        const context = {
            MANY_TO_MANY_TRACKED_RELATIONS,
        };
        let hasIdAlreadyDefined = false;
        /**
         * Processing schema fields
         */
        Object.entries(schema).forEach(([name, property]) => {
            const field = property.parse(name);
            if ("fieldName" in field) {
                if (id_1.IdProperty.isIdProperty(field)) {
                    if (hasIdAlreadyDefined) {
                        throw new errors_1.DuplicateIdPropertyError(modelName);
                    }
                    hasIdAlreadyDefined = true;
                }
                (0, define_property_1.defineProperty)(MikroORMEntity, property, {
                    propertyName: name,
                    tableName,
                });
                (0, apply_indexes_1.applyIndexes)(MikroORMEntity, tableName, field);
                (0, apply_searchable_1.applySearchable)(MikroORMEntity, field);
            }
            else {
                (0, define_relationship_1.defineRelationship)(MikroORMEntity, entity, field, cascades, context);
                (0, apply_searchable_1.applySearchable)(MikroORMEntity, field);
            }
        });
        (0, apply_indexes_1.applyEntityIndexes)(MikroORMEntity, tableName, entityIndexes);
        (0, apply_checks_1.applyChecks)(MikroORMEntity, checks);
        /**
         * Converting class to a MikroORM entity
         */
        (0, core_1.Filter)((0, dal_1.mikroOrmFreeTextSearchFilterOptionsFactory)(modelName))(MikroORMEntity);
        const RegisteredEntity = (0, core_1.Entity)({ tableName })((0, core_1.Filter)(dal_1.mikroOrmSoftDeletableFilterOptions)(MikroORMEntity));
        ENTITIES[modelName] = RegisteredEntity;
        return RegisteredEntity;
    }
    /**
     * Clear the internally tracked entities and relationships
     */
    createEntity.clear = function () {
        MANY_TO_MANY_TRACKED_RELATIONS = {};
        ENTITIES = {};
    };
    return createEntity;
}
/**
 * Helper function to convert DML entities to MikroORM entity. Use
 * "toMikroORMEntity" if you are ensure the input is a DML entity
 * or not.
 */
exports.mikroORMEntityBuilder = createMikrORMEntity();
/**
 * Takes a DML entity and returns a Mikro ORM entity otherwise
 * return the input idempotently
 * @param entity
 */
const toMikroORMEntity = (entity) => {
    let mikroOrmEntity = entity;
    if (entity_1.DmlEntity.isDmlEntity(entity)) {
        mikroOrmEntity = (0, exports.mikroORMEntityBuilder)(entity);
    }
    return mikroOrmEntity;
};
exports.toMikroORMEntity = toMikroORMEntity;
/**
 * Takes any DmlEntity or mikro orm entities and return mikro orm entities only.
 * This action is idempotent if non of the entities are DmlEntity
 * @param entities
 */
const toMikroOrmEntities = function (entities) {
    return entities.map((entity) => {
        if (entity_1.DmlEntity.isDmlEntity(entity)) {
            return (0, exports.mikroORMEntityBuilder)(entity);
        }
        return entity;
    });
};
exports.toMikroOrmEntities = toMikroOrmEntities;
//# sourceMappingURL=create-mikro-orm-entity.js.map