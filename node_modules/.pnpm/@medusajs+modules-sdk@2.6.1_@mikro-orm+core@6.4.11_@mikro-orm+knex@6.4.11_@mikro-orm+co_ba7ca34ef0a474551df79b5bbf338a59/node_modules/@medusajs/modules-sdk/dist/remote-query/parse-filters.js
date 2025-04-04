"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseAndAssignFilters = parseAndAssignFilters;
const utils_1 = require("@medusajs/utils");
const medusa_module_1 = require("../medusa-module");
const joinerConfigMapCache = new Map();
/**
 * Parse and assign filters to remote query object to the corresponding relation level
 * @param entryPoint
 * @param filters
 * @param remoteQueryObject
 * @param isFieldAliasNestedRelation
 * @param entitiesMap
 */
function parseAndAssignFilters({ entryPoint, filters, remoteQueryObject, isFieldAliasNestedRelation, }, entitiesMap) {
    const joinerConfigs = medusa_module_1.MedusaModule.getAllJoinerConfigs();
    for (const [filterKey, filterValue] of Object.entries(filters)) {
        /*let entryAlias!: JoinerServiceConfigAlias*/
        let entryJoinerConfig;
        const { joinerConfig /*alias*/ } = retrieveJoinerConfigFromPropertyName({
            entryPoint: entryPoint,
            joinerConfigs,
        });
        /*JoinerServiceConfigentryAlias = alias!*/
        entryJoinerConfig = joinerConfig;
        // TODO: This check is not used further than to validate the entity is part of the graphql schema
        // This can't be used right now as we have not migrated the entire code base to DML from which the graphql schema is generated
        /*const entryEntity = entitiesMap[entryAlias.entity!]
        if (!entryEntity) {
          throw new Error(
            `Entity ${entryAlias.entity} not found in the public schema of the joiner config from ${entryJoinerConfig.serviceName}`
          )
        }*/
        if ((0, utils_1.isObject)(filterValue)) {
            for (const [nestedFilterKey, nestedFilterValue] of Object.entries(filterValue)) {
                const { joinerConfig: filterKeyJoinerConfig } = retrieveJoinerConfigFromPropertyName({
                    entryPoint: nestedFilterKey,
                    parentJoinerConfig: joinerConfig,
                    joinerConfigs,
                });
                if (!filterKeyJoinerConfig ||
                    filterKeyJoinerConfig.serviceName === entryJoinerConfig.serviceName) {
                    assignNestedRemoteQueryObject({
                        entryPoint,
                        filterKey,
                        nestedFilterKey,
                        filterValue,
                        nestedFilterValue,
                        remoteQueryObject,
                        isFieldAliasNestedRelation,
                    });
                }
                else {
                    const isFieldAliasNestedRelation_ = isFieldAliasNestedRelationHelper({
                        nestedFilterKey,
                        entryJoinerConfig,
                        joinerConfigs,
                        filterKeyJoinerConfig,
                    });
                    parseAndAssignFilters({
                        entryPoint: nestedFilterKey,
                        filters: nestedFilterValue,
                        remoteQueryObject: remoteQueryObject[entryPoint][filterKey],
                        isFieldAliasNestedRelation: isFieldAliasNestedRelation_,
                    }, entitiesMap);
                }
            }
            continue;
        }
        assignRemoteQueryObject({
            entryPoint,
            filterKey,
            filterValue,
            remoteQueryObject,
            isFieldAliasNestedRelation,
        });
    }
}
function retrieveJoinerConfigFromPropertyName({ entryPoint, parentJoinerConfig, joinerConfigs, }) {
    if (parentJoinerConfig) {
        const res = findAliasFromJoinerConfig({
            joinerConfig: parentJoinerConfig,
            entryPoint,
        });
        if (res) {
            return res;
        }
    }
    if (joinerConfigMapCache.has(entryPoint)) {
        return joinerConfigMapCache.get(entryPoint);
    }
    for (const joinerConfig of joinerConfigs) {
        const joinerConfigAlias = joinerConfig.alias ?? [];
        const aliases = Array.isArray(joinerConfigAlias)
            ? joinerConfigAlias
            : [joinerConfigAlias];
        const entryPointAlias = aliases.find((alias) => {
            const aliasNames = Array.isArray(alias.name) ? alias.name : [alias.name];
            return aliasNames.some((alias) => alias === entryPoint);
        });
        if (entryPointAlias) {
            joinerConfigMapCache.set(entryPoint, {
                joinerConfig,
                alias: entryPointAlias,
            });
            return { joinerConfig, alias: entryPointAlias };
        }
    }
    return {};
}
function findAliasFromJoinerConfig({ joinerConfig, entryPoint, }) {
    const joinerConfigAlias = joinerConfig.alias ?? [];
    const aliases = Array.isArray(joinerConfigAlias)
        ? joinerConfigAlias
        : [joinerConfigAlias];
    const entryPointAlias = aliases.find((alias) => {
        const aliasNames = Array.isArray(alias.name) ? alias.name : [alias.name];
        return aliasNames.some((alias) => alias === entryPoint);
    });
    if (entryPointAlias) {
        joinerConfigMapCache.set(entryPoint, {
            joinerConfig,
            alias: entryPointAlias,
        });
        return { joinerConfig, alias: entryPointAlias };
    }
    return;
}
function assignRemoteQueryObject({ entryPoint, filterKey, filterValue, remoteQueryObject, isFieldAliasNestedRelation, }) {
    remoteQueryObject[entryPoint] ??= {};
    remoteQueryObject[entryPoint].__args ??= {};
    remoteQueryObject[entryPoint].__args["filters"] ??= {};
    if (!isFieldAliasNestedRelation) {
        remoteQueryObject[entryPoint].__args["filters"][filterKey] = filterValue;
    }
    else {
        // In case of field alias that refers to a relation of linked entity we need to assign the filter on the relation filter itself instead of top level of the args\
        remoteQueryObject[entryPoint].__args["filters"][entryPoint] ??= {};
        remoteQueryObject[entryPoint].__args["filters"][entryPoint][filterKey] =
            filterValue;
    }
}
function assignNestedRemoteQueryObject({ entryPoint, filterKey, nestedFilterKey, nestedFilterValue, remoteQueryObject, isFieldAliasNestedRelation, }) {
    remoteQueryObject[entryPoint] ??= {};
    remoteQueryObject[entryPoint]["__args"] ??= {};
    remoteQueryObject[entryPoint]["__args"]["filters"] ??= {};
    if (!isFieldAliasNestedRelation) {
        remoteQueryObject[entryPoint]["__args"]["filters"][filterKey] ??= {};
        remoteQueryObject[entryPoint]["__args"]["filters"][filterKey][nestedFilterKey] = nestedFilterValue;
    }
    else {
        // In case of field alias that refers to a relation of linked entity we need to assign the filter on the relation filter itself instead of top level of the args
        remoteQueryObject[entryPoint]["__args"]["filters"][entryPoint] ??= {};
        remoteQueryObject[entryPoint]["__args"]["filters"][entryPoint][filterKey] ??= {};
        remoteQueryObject[entryPoint]["__args"]["filters"][entryPoint][filterKey][nestedFilterKey] = nestedFilterValue;
    }
}
function isFieldAliasNestedRelationHelper({ nestedFilterKey, entryJoinerConfig, joinerConfigs, filterKeyJoinerConfig, }) {
    const linkJoinerConfig = joinerConfigs.find((joinerConfig) => {
        return joinerConfig.relationships?.every((rel) => rel.serviceName === entryJoinerConfig.serviceName ||
            rel.serviceName === filterKeyJoinerConfig.serviceName);
    });
    const relationsAlias = linkJoinerConfig?.relationships?.map((r) => r.alias);
    let isFieldAliasNestedRelation = false;
    if (linkJoinerConfig && relationsAlias?.length) {
        const fieldAlias = linkJoinerConfig.extends?.find((extend) => extend.fieldAlias?.[nestedFilterKey])?.fieldAlias;
        if (fieldAlias) {
            const path = (0, utils_1.isString)(fieldAlias?.[nestedFilterKey])
                ? fieldAlias?.[nestedFilterKey]
                : (fieldAlias?.[nestedFilterKey]).path;
            if (!relationsAlias.includes(path.split(".").pop())) {
                isFieldAliasNestedRelation = true;
            }
        }
    }
    return isFieldAliasNestedRelation;
}
//# sourceMappingURL=parse-filters.js.map