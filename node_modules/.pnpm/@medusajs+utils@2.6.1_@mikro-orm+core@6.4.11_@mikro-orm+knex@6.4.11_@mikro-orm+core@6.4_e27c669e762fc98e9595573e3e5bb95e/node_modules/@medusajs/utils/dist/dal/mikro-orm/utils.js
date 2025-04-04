"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mikroOrmUpdateDeletedAtRecursively = void 0;
const common_1 = require("../../common");
const is_string_1 = require("../../common/is-string");
const build_query_1 = require("../../modules-sdk/build-query");
function detectCircularDependency(manager, entityMetadata, visited = new Set(), shouldStop = false) {
    if (shouldStop) {
        return;
    }
    visited.add(entityMetadata.className);
    const relations = entityMetadata.relations;
    const relationsToCascade = relations.filter((relation) => relation.cascade?.includes("soft-remove"));
    for (const relation of relationsToCascade) {
        const branchVisited = new Set(Array.from(visited));
        const relationEntity = typeof relation.entity === "function"
            ? relation.entity()
            : relation.entity;
        const isSelfCircularDependency = (0, is_string_1.isString)(relationEntity)
            ? entityMetadata.className === relationEntity
            : entityMetadata.class === relationEntity;
        if (!isSelfCircularDependency && branchVisited.has(relation.name)) {
            const dependencies = Array.from(visited);
            dependencies.push(entityMetadata.className);
            const circularDependencyStr = dependencies.join(" -> ");
            throw new Error(`Unable to soft delete the ${relation.name}. Circular dependency detected: ${circularDependencyStr}`);
        }
        branchVisited.add(relation.name);
        const relationEntityMetadata = manager
            .getDriver()
            .getMetadata()
            .get(relation.type);
        detectCircularDependency(manager, relationEntityMetadata, branchVisited, isSelfCircularDependency);
    }
}
async function performCascadingSoftDeletion(manager, entity, value, softDeletedEntitiesMap = new Map()) {
    if (!("deleted_at" in entity))
        return;
    entity.deleted_at = value;
    const softDeletedEntityMapItem = softDeletedEntitiesMap.get(entity.constructor.name);
    if (!softDeletedEntityMapItem) {
        softDeletedEntitiesMap.set(entity.constructor.name, [entity]);
    }
    else {
        softDeletedEntityMapItem.push(entity);
    }
    const entityName = entity.constructor.name;
    const entityMetadata = manager.getDriver().getMetadata().get(entityName);
    const relations = entityMetadata.relations;
    const relationsToCascade = relations.filter((relation) => relation.cascade?.includes("soft-remove"));
    // If there are no relations to cascade, just persist the entity and return
    if (!relationsToCascade.length) {
        manager.persist(entity);
        return;
    }
    // Fetch the entity with all cascading relations in a single query
    const relationNames = relationsToCascade.map((r) => r.name);
    const query = (0, build_query_1.buildQuery)({
        id: entity.id,
    }, {
        select: [
            "id",
            "deleted_at",
            ...relationNames.flatMap((r) => [`${r}.id`, `${r}.deleted_at`]),
        ],
        relations: relationNames,
        withDeleted: true,
    });
    const entityWithRelations = await manager.findOne(entityName, query.where, {
        ...query.options,
        populateFilter: {
            withDeleted: true,
        },
    });
    if (!entityWithRelations) {
        manager.persist(entity);
        return;
    }
    // Create a map to group related entities by their type
    const relatedEntitiesByType = new Map();
    // Collect all related entities by type
    for (const relation of relationsToCascade) {
        const entityRelation = entityWithRelations[relation.name];
        // Skip if relation is null or undefined
        if (!entityRelation) {
            continue;
        }
        const isCollection = "toArray" in entityRelation;
        let relationEntities = [];
        if (isCollection) {
            relationEntities = entityRelation.getItems();
        }
        else {
            relationEntities = [entityRelation];
        }
        if (!relationEntities.length) {
            continue;
        }
        // Add to the map of entities by type
        if (!relatedEntitiesByType.has(relation.type)) {
            relatedEntitiesByType.set(relation.type, []);
        }
        relatedEntitiesByType.get(relation.type).push(...relationEntities);
    }
    // Process each type of related entity in batch
    const promises = [];
    for (const [, entities] of relatedEntitiesByType.entries()) {
        if (entities.length === 0)
            continue;
        // Process cascading relations for these entities
        promises.push(...entities.map((entity) => performCascadingSoftDeletion(manager, entity, value, softDeletedEntitiesMap)));
    }
    await (0, common_1.promiseAll)(promises);
    manager.persist(entity);
}
/**
 * Updates the deleted_at field for all entities in the given array and their
 * cascaded relations and returns a map of entity IDs to their corresponding
 * entity types.
 *
 * @param manager - The Mikro ORM manager instance.
 * @param entities - An array of entities to update.
 * @param value - The value to set for the deleted_at field.
 * @returns A map of entity IDs to their corresponding entity types.
 */
const mikroOrmUpdateDeletedAtRecursively = async (manager, entities, value) => {
    const softDeletedEntitiesMap = new Map();
    if (!entities.length)
        return softDeletedEntitiesMap;
    const entityMetadata = manager
        .getDriver()
        .getMetadata()
        .get(entities[0].constructor.name);
    detectCircularDependency(manager, entityMetadata);
    // Process each entity type
    for (const entity of entities) {
        await performCascadingSoftDeletion(manager, entity, value, softDeletedEntitiesMap);
    }
    return softDeletedEntitiesMap;
};
exports.mikroOrmUpdateDeletedAtRecursively = mikroOrmUpdateDeletedAtRecursively;
//# sourceMappingURL=utils.js.map