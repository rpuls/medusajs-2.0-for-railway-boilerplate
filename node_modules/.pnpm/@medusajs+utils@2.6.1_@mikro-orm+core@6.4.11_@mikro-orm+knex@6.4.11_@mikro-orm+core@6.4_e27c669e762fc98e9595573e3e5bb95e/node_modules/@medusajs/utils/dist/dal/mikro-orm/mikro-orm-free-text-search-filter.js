"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mikroOrmFreeTextSearchFilterOptionsFactory = exports.FreeTextSearchFilterKeyPrefix = void 0;
const core_1 = require("@mikro-orm/core");
exports.FreeTextSearchFilterKeyPrefix = "freeTextSearch_";
function getEntityProperties(metadata) {
    return metadata.properties;
}
function retrieveRelationsConstraints(relation, metadata, searchValue, visited = new Set(), shouldStop = false) {
    if (shouldStop || !relation.searchable) {
        return;
    }
    const relationClassName = relation.targetMeta.className;
    visited.add(relationClassName);
    const relationFreeTextSearchWhere = [];
    const relationProperties = getEntityProperties(metadata);
    for (const propertyConfiguration of Object.values(relationProperties)) {
        if (!propertyConfiguration.searchable ||
            propertyConfiguration.kind !== core_1.ReferenceKind.SCALAR) {
            continue;
        }
        const isText = propertyConfiguration?.columnTypes?.includes("text");
        const columnName = isText
            ? propertyConfiguration.name
            : `${propertyConfiguration.name}::text`;
        relationFreeTextSearchWhere.push({
            [columnName]: {
                $ilike: `%${searchValue}%`,
            },
        });
    }
    const innerRelations = metadata.relations;
    for (const innerRelation of innerRelations) {
        const branchVisited = new Set(Array.from(visited));
        const innerRelationClassName = innerRelation.targetMeta.className;
        const isSelfCircularDependency = innerRelationClassName === relationClassName;
        if (!isSelfCircularDependency &&
            branchVisited.has(innerRelationClassName)) {
            continue;
        }
        branchVisited.add(innerRelationClassName);
        const innerRelationName = !innerRelation.mapToPk
            ? innerRelation.name
            : relation.targetMeta.relations.find((r) => r.type === innerRelation.type && !r.mapToPk)?.name;
        if (!innerRelationName) {
            throw new Error(`Unable to retrieve the counter part relation definition for the mapToPk relation ${innerRelation.name} on entity ${relation.name}`);
        }
        const relationConstraints = retrieveRelationsConstraints({
            name: innerRelationName,
            targetMeta: innerRelation.targetMeta,
            searchable: innerRelation.searchable,
            mapToPk: innerRelation.mapToPk,
            type: innerRelation.type,
        }, innerRelation.targetMeta, searchValue, branchVisited, isSelfCircularDependency);
        if (!relationConstraints?.length) {
            continue;
        }
        relationFreeTextSearchWhere.push({
            [innerRelationName]: {
                $or: relationConstraints,
            },
        });
    }
    return relationFreeTextSearchWhere;
}
const mikroOrmFreeTextSearchFilterOptionsFactory = (model) => {
    return {
        name: exports.FreeTextSearchFilterKeyPrefix + model,
        cond: (freeTextSearchArgs, operation, manager, options) => {
            if (!freeTextSearchArgs || !freeTextSearchArgs.value) {
                return {};
            }
            const { value } = freeTextSearchArgs;
            if (options?.visited?.size) {
                /**
                 * When being in select in strategy, the filter gets applied to all queries even the ones that are not related to the entity
                 */
                const hasFilterAlreadyBeenAppliedForEntity = [
                    ...options.visited.values(),
                ].some((v) => v.constructor.name === freeTextSearchArgs.fromEntity);
                if (hasFilterAlreadyBeenAppliedForEntity) {
                    return {};
                }
            }
            const entityMetadata = manager.getDriver().getMetadata().get(model);
            const freeTextSearchWhere = retrieveRelationsConstraints({
                targetMeta: entityMetadata,
                mapToPk: false,
                searchable: true,
                type: model,
                name: entityMetadata.name,
            }, entityMetadata, value);
            if (!freeTextSearchWhere.length) {
                return {};
            }
            return {
                $or: freeTextSearchWhere,
            };
        },
    };
};
exports.mikroOrmFreeTextSearchFilterOptionsFactory = mikroOrmFreeTextSearchFilterOptionsFactory;
//# sourceMappingURL=mikro-orm-free-text-search-filter.js.map