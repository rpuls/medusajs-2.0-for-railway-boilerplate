"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineJoinerConfig = defineJoinerConfig;
exports.buildLinkableKeysFromDmlObjects = buildLinkableKeysFromDmlObjects;
exports.buildLinkableKeysFromMikroOrmObjects = buildLinkableKeysFromMikroOrmObjects;
exports.buildLinkConfigFromModelObjects = buildLinkConfigFromModelObjects;
exports.buildLinkConfigFromLinkableKeys = buildLinkConfigFromLinkableKeys;
exports.buildModelsNameToLinkableKeysMap = buildModelsNameToLinkableKeysMap;
const fs_1 = require("fs");
const path = __importStar(require("path"));
const path_1 = require("path");
const common_1 = require("../common");
const dml_1 = require("../dml");
const create_graphql_1 = require("../dml/helpers/create-graphql");
const primary_key_1 = require("../dml/properties/primary-key");
const base_1 = require("../dml/relations/base");
const load_models_1 = require("./loaders/load-models");
/**
 * Define joiner config for a module based on the models (object representation or entities) present in the models directory. This action will be sync until
 * we move to at least es2022 to have access to top-leve await.
 *
 * The aliases will be built from the entityQueryingConfig and custom aliases if provided, in case of aliases provided if the methodSuffix is not provided
 * then it will be inferred from the entity name of the alias args.
 *
 * @param serviceName
 * @param alias custom aliases will be merged with the computed aliases from the provided models. Though, if a custom alias correspond to a computed alias for the same model then the custom alias will take place. Also, note that the methodSuffix will be inferred from the entity name if not provided as part of the args.
 * @param schema
 * @param models
 * @param linkableKeys
 * @param primaryKeys
 */
function defineJoinerConfig(serviceName, { alias, schema, models, linkableKeys, primaryKeys, } = {}) {
    let loadedModels = models;
    if (!loadedModels) {
        loadedModels = [];
        let index = 1;
        while (true) {
            ++index;
            let fullPath = (0, common_1.getCallerFilePath)(index);
            if (!fullPath) {
                break;
            }
            fullPath = (0, path_1.normalize)(fullPath);
            const integrationTestPotentialPath = (0, path_1.normalize)("integration-tests/__tests__");
            /**
             * Handle integration-tests/__tests__ path based on conventional naming
             */
            if (fullPath.includes(integrationTestPotentialPath)) {
                const sourcePath = fullPath.split(integrationTestPotentialPath)[0];
                fullPath = path.join(sourcePath, "src");
            }
            const srcDir = fullPath.includes("dist") ? "dist" : "src";
            const splitPath = fullPath.split(srcDir);
            let basePath = splitPath[0] + srcDir;
            const potentialModulesDirPathSegment = (0, path_1.normalize)(`${srcDir}/modules/`);
            const isMedusaProject = fullPath.includes(potentialModulesDirPathSegment);
            if (isMedusaProject) {
                basePath = (0, path_1.dirname)(fullPath);
            }
            basePath = (0, path_1.join)(basePath, "models");
            let doesModelsDirExist = false;
            try {
                (0, fs_1.accessSync)(path.resolve(basePath));
                doesModelsDirExist = true;
            }
            catch (e) { }
            if (!doesModelsDirExist) {
                continue;
            }
            loadedModels = (0, load_models_1.loadModels)(basePath);
            if (loadedModels.length) {
                break;
            }
        }
    }
    const modelDefinitions = new Map(loadedModels
        .filter((model) => !!dml_1.DmlEntity.isDmlEntity(model))
        .map((model) => [model.name, model]));
    const mikroOrmObjects = new Map(loadedModels
        .filter((model) => !dml_1.DmlEntity.isDmlEntity(model))
        .map((model) => [model.name, model]));
    // We prioritize DML if there is any equivalent Mikro orm entities found
    const deduplicatedLoadedModels = [...modelDefinitions.values()];
    mikroOrmObjects.forEach((model) => {
        if (modelDefinitions.has(model.name)) {
            return;
        }
        deduplicatedLoadedModels.push(model);
    });
    if (!schema) {
        schema = (0, create_graphql_1.toGraphQLSchema)([...modelDefinitions.values()]);
    }
    const linkableKeysFromDml = buildLinkableKeysFromDmlObjects([
        ...modelDefinitions.values(),
    ]);
    const linkableKeysFromMikroOrm = buildLinkableKeysFromMikroOrmObjects([
        ...mikroOrmObjects.values(),
    ]);
    const mergedLinkableKeys = {
        ...linkableKeysFromDml,
        ...linkableKeysFromMikroOrm,
        ...linkableKeys,
    };
    linkableKeys = mergedLinkableKeys;
    /**
     * Merge custom primary keys from the joiner config with the infered primary keys
     * from the models.
     *
     * TODO: Maybe worth looking into the real needs for primary keys.
     * It can happen that we could just remove that but we need to investigate (looking at the
     * lookups from the remote joiner to identify which entity a property refers to)
     */
    primaryKeys ??= [];
    const finalPrimaryKeys = new Set(primaryKeys);
    if (modelDefinitions.size) {
        const linkConfig = buildLinkConfigFromModelObjects(serviceName, Object.fromEntries(modelDefinitions));
        Object.values(linkConfig).flatMap((entityLinkConfig) => {
            return Object.values(entityLinkConfig)
                .filter((linkableConfig) => (0, common_1.isObject)(linkableConfig))
                .forEach((linkableConfig) => {
                finalPrimaryKeys.add(linkableConfig.primaryKey);
            });
        });
    }
    primaryKeys = Array.from(finalPrimaryKeys.add("id"));
    // TODO: In the context of DML add a validation on primary keys and linkable keys if the consumer provide them manually. follow up pr
    return {
        serviceName,
        primaryKeys,
        schema,
        linkableKeys: linkableKeys,
        alias: [
            ...[...(alias ?? [])].map((alias) => ({
                name: alias.name,
                entity: alias.entity,
                args: {
                    methodSuffix: alias.args?.methodSuffix ?? (0, common_1.pluralize)((0, common_1.upperCaseFirst)(alias.entity)),
                },
            })),
            ...deduplicatedLoadedModels
                .filter((model) => {
                return (!alias ||
                    !alias.some((alias) => alias.entity === (0, common_1.upperCaseFirst)(model.name)));
            })
                .map((entity, i) => ({
                name: [
                    `${(0, common_1.camelToSnakeCase)(entity.name).toLowerCase()}`,
                    `${(0, common_1.pluralize)((0, common_1.camelToSnakeCase)(entity.name).toLowerCase())}`,
                ],
                entity: (0, common_1.upperCaseFirst)(entity.name),
                args: {
                    methodSuffix: (0, common_1.pluralize)((0, common_1.upperCaseFirst)(entity.name)),
                },
            })),
        ],
    };
}
/**
 * From a set of DML objects, build the linkable keys
 *
 * @example
 * const user = model.define("user", {
 *   id: model.id(),
 *   name: model.text(),
 * })
 *
 * const car = model.define("car", {
 *   id: model.id(),
 *   number_plate: model.text().primaryKey(),
 *   test: model.text(),
 * })
 *
 * const linkableKeys = buildLinkableKeysFromDmlObjects([user, car])
 *
 * // output:
 * // {
 * //   user_id: 'User',
 * //   car_number_plate: 'Car',
 * // }
 *
 * @param models
 */
function buildLinkableKeysFromDmlObjects(models) {
    const linkableKeys = {};
    for (const model of models) {
        if (!dml_1.DmlEntity.isDmlEntity(model)) {
            continue;
        }
        const schema = model.schema;
        const primaryKeys = [];
        for (const [property, value] of Object.entries(schema)) {
            if (base_1.BaseRelationship.isRelationship(value)) {
                continue;
            }
            const parsedProperty = value.parse(property);
            if (primary_key_1.PrimaryKeyModifier.isPrimaryKeyModifier(value)) {
                const linkableKeyName = parsedProperty.dataType.options?.linkable ??
                    `${(0, common_1.camelToSnakeCase)(model.name).toLowerCase()}_${property}`;
                primaryKeys.push(linkableKeyName);
            }
        }
        if (primaryKeys.length) {
            primaryKeys.forEach((primaryKey) => {
                linkableKeys[primaryKey] = (0, common_1.upperCaseFirst)(model.name);
            });
        }
    }
    return linkableKeys;
}
/**
 * Build linkable keys from MikroORM objects
 * @deprecated
 * @param models
 */
function buildLinkableKeysFromMikroOrmObjects(models) {
    return models.reduce((acc, entity) => {
        acc[`${(0, common_1.camelToSnakeCase)(entity.name).toLowerCase()}_id`] = entity.name;
        return acc;
    }, {});
}
/**
 * Build entities name to linkable keys map
 *
 * @example
 * const user = model.define("user", {
 *   id: model.id(),
 *   name: model.text(),
 * })
 *
 * const car = model.define("car", {
 *   id: model.id(),
 *   number_plate: model.text().primaryKey(),
 *   test: model.text(),
 * })
 *
 * const links = buildLinkConfigFromModelObjects('userService', { user, car })
 *
 * // output:
 * // {
 * //   user: {
 * //     id: {
 * //       serviceName: 'userService', // The name of the module service it originate from
 * //       field: 'user',              // The field name of the entity, the query field is inferred from it as kebab cased singular/plural
 * //       linkable: 'user_id',        // The linkable key
 * //       primaryKey: 'id'            // The primary key if refers to in the original object representation, it will be used to be passed to the filters of the corresponding public service method
 * //     },
 * //     toJSON() { ... }
 * //   },
 * //   car: {
 * //     number_plate: {
 * //       serviceName: 'userService',
 * //       field: 'car',
 * //       linkable: 'car_number_plate',
 * //       primaryKey: 'number_plate'
 * //     },
 * //     toJSON() { ... }
 * //   }
 * // }
 *
 * @param serviceName
 * @param models
 */
function buildLinkConfigFromModelObjects(serviceName, models, linkableKeys = {}) {
    // In case some models have been provided to a custom joiner config, the linkable will be limited
    // to that set of models. We dont want to expose models that should not be linkable.
    const linkableModels = Object.values(linkableKeys);
    const linkConfig = {};
    for (const model of Object.values(models) ?? []) {
        const classLikeModelName = (0, common_1.upperCaseFirst)(model.name);
        if (!dml_1.DmlEntity.isDmlEntity(model) ||
            (linkableModels.length && !linkableModels.includes(classLikeModelName))) {
            continue;
        }
        const schema = model.schema;
        /**
         * When using a linkable, if a specific linkable property is not specified, the toJSON
         * function will be called and return the first linkable available for this model.
         */
        const modelLinkConfig = (linkConfig[(0, common_1.lowerCaseFirst)(model.name)] ??= {
            toJSON: function () {
                const linkables = Object.entries(this)
                    .filter(([name]) => name !== "toJSON")
                    .map(([, object]) => object);
                return linkables[0];
            },
        });
        /**
         * Build all linkable properties for the model
         */
        for (const [property, value] of Object.entries(schema)) {
            if (base_1.BaseRelationship.isRelationship(value)) {
                continue;
            }
            const parsedProperty = value.parse(property);
            if (primary_key_1.PrimaryKeyModifier.isPrimaryKeyModifier(value) ||
                dml_1.IdProperty.isIdProperty(value)) {
                const linkableKeyName = parsedProperty.dataType.options?.linkable ??
                    `${(0, common_1.camelToSnakeCase)(model.name).toLowerCase()}_${property}`;
                modelLinkConfig[property] = {
                    linkable: linkableKeyName,
                    primaryKey: property,
                    serviceName,
                    field: (0, common_1.lowerCaseFirst)(model.name),
                    entity: classLikeModelName,
                };
            }
        }
    }
    /**
     * If the joiner config specify some custom linkable keys, we merge them with the
     * existing linkable keys infered from the model above.
     */
    for (const [linkableKey, modelName] of Object.entries(linkableKeys) ?? []) {
        const snakeCasedModelName = (0, common_1.camelToSnakeCase)((0, common_1.toCamelCase)(modelName));
        // Linkable keys by default are prepared with snake cased model name _id
        // So to be able to compare only the property we have to remove the first part
        const inferredReferenceProperty = linkableKey.replace(`${snakeCasedModelName}_`, "");
        linkConfig[(0, common_1.lowerCaseFirst)(modelName)] ??= {
            toJSON: function () {
                const linkables = Object.entries(this)
                    .filter(([name]) => name !== "toJSON")
                    .map(([, object]) => object);
                return linkables[0];
            },
        };
        if (linkConfig[(0, common_1.lowerCaseFirst)(modelName)][inferredReferenceProperty]) {
            continue;
        }
        linkConfig[(0, common_1.lowerCaseFirst)(modelName)][inferredReferenceProperty] = {
            linkable: linkableKey,
            primaryKey: inferredReferenceProperty,
            serviceName,
            field: (0, common_1.lowerCaseFirst)(modelName),
            entity: (0, common_1.upperCaseFirst)(modelName),
        };
    }
    return linkConfig;
}
/**
 * @deprecated temporary supports for mikro orm entities to get the linkable available from the module export while waiting for the migration to DML
 *
 * @param serviceName
 * @param linkableKeys
 */
function buildLinkConfigFromLinkableKeys(serviceName, linkableKeys) {
    const linkConfig = {};
    for (const [linkable, modelName] of Object.entries(linkableKeys)) {
        const kebabCasedModelName = (0, common_1.camelToSnakeCase)((0, common_1.toCamelCase)(modelName));
        const inferredReferenceProperty = linkable.replace(`${kebabCasedModelName}_`, "");
        const keyName = (0, common_1.lowerCaseFirst)(modelName);
        const config = {
            linkable: linkable,
            primaryKey: inferredReferenceProperty,
            serviceName,
            field: keyName,
            entity: (0, common_1.upperCaseFirst)(modelName),
        };
        linkConfig[keyName] ??= {
            toJSON: () => config,
        };
        linkConfig[keyName][inferredReferenceProperty] = config;
    }
    return linkConfig;
}
/**
 * Reversed map from linkableKeys to entity name to linkable keys
 * @param linkableKeys
 */
function buildModelsNameToLinkableKeysMap(linkableKeys) {
    const entityLinkableKeysMap = {};
    Object.entries(linkableKeys).forEach(([key, value]) => {
        entityLinkableKeysMap[value] ??= [];
        entityLinkableKeysMap[value].push({
            mapTo: key,
            valueFrom: key.split("_").pop(),
        });
    });
    return entityLinkableKeysMap;
}
//# sourceMappingURL=joiner-config-builder.js.map