"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedusaServiceModelNameToLinkableKeysMapSymbol = exports.MedusaServiceSymbol = exports.MedusaServiceModelObjectsSymbol = void 0;
exports.isMedusaService = isMedusaService;
exports.MedusaService = MedusaService;
const common_1 = require("../common");
const dml_1 = require("../dml");
const event_bus_1 = require("../event-bus");
const decorators_1 = require("./decorators");
const definition_1 = require("./definition");
const event_builder_factory_1 = require("./event-builder-factory");
const joiner_config_builder_1 = require("./joiner-config-builder");
const readMethods = ["retrieve", "list", "listAndCount"];
const writeMethods = [
    "delete",
    "softDelete",
    "restore",
    "create",
    "update",
];
const methods = [...readMethods, ...writeMethods];
/**
 * @internal
 */
function buildMethodNamesFromModel(defaultMethodName, model) {
    return methods.reduce((acc, method) => {
        let normalizedModelName = "";
        if (method === "retrieve") {
            normalizedModelName =
                model && "singular" in model && model.singular
                    ? model.singular
                    : defaultMethodName;
        }
        else {
            normalizedModelName =
                model && "plural" in model && model.plural
                    ? model.plural
                    : (0, common_1.pluralize)(defaultMethodName);
        }
        const methodName = `${method}${(0, common_1.upperCaseFirst)(normalizedModelName)}`;
        return { ...acc, [method]: methodName };
    }, {});
}
/**
 * Accessible from the MedusaService, holds the model objects when provided
 */
exports.MedusaServiceModelObjectsSymbol = Symbol.for("MedusaServiceModelObjectsSymbol");
/**
 * Symbol to mark a class as a Medusa service
 */
exports.MedusaServiceSymbol = Symbol.for("MedusaServiceSymbol");
/**
 * Accessible from the MedusaService, holds the model name to linkable keys map
 * to be used for softDelete and restore methods
 */
exports.MedusaServiceModelNameToLinkableKeysMapSymbol = Symbol.for("MedusaServiceModelNameToLinkableKeysMapSymbol");
/**
 * Check if a value is a Medusa service
 * @param value
 */
function isMedusaService(value) {
    return value && value?.prototype[exports.MedusaServiceSymbol];
}
/**
 * Factory function for creating an abstract module service
 *
 * @example
 *
 * // Here the DTO's and names will be inferred from the arguments
 *
 * const models = {
 *   Currency,
 *   Price,
 *   PriceList,
 *   PriceListRule,
 *   PriceListRuleValue,
 *   PriceRule,
 *   PriceSetRuleType,
 *   RuleType,
 * }
 *
 * class MyService extends ModulesSdkUtils.MedusaService(models) {}
 *
 * @param models
 */
function MedusaService(models) {
    var _a, _b;
    function emitSoftDeleteRestoreEvents(klassPrototype, cascadedModelsMap, action, sharedContext) {
        const joinerConfig = (typeof this.__joinerConfig === "function"
            ? this.__joinerConfig()
            : this.__joinerConfig);
        const emittedEntities = new Set();
        Object.entries(cascadedModelsMap).forEach(([linkableKey, ids]) => {
            const entity = joinerConfig.linkableKeys?.[linkableKey];
            if (entity && !emittedEntities.has(entity)) {
                emittedEntities.add(entity);
                const linkableKeyEntity = (0, common_1.camelToSnakeCase)(entity).toLowerCase();
                klassPrototype.aggregatedEvents.bind(this)({
                    action: action,
                    object: linkableKeyEntity,
                    data: { id: ids },
                    context: sharedContext,
                });
            }
        });
    }
    const buildAndAssignMethodImpl = function (klassPrototype, method, methodName, modelName) {
        const serviceRegistrationName = `${(0, common_1.lowerCaseFirst)(modelName)}Service`;
        const applyMethod = function (impl, contextIndex) {
            klassPrototype[methodName] = impl;
            const descriptorMockRef = {
                value: klassPrototype[methodName],
            };
            // The order of the decorators is important, do not change it
            (0, decorators_1.MedusaContext)()(klassPrototype, methodName, contextIndex);
            (0, decorators_1.EmitEvents)()(klassPrototype, methodName, descriptorMockRef);
            (0, decorators_1.InjectManager)()(klassPrototype, methodName, descriptorMockRef);
            klassPrototype[methodName] = descriptorMockRef.value;
        };
        let methodImplementation = function () {
            void 0;
        };
        switch (method) {
            case "retrieve":
                methodImplementation = async function (id, config, sharedContext = {}) {
                    const models = await this.__container__[serviceRegistrationName].retrieve(id, config, sharedContext);
                    return await this.baseRepository_.serialize(models);
                };
                applyMethod(methodImplementation, 2);
                break;
            case "create":
                methodImplementation = async function (data = [], sharedContext = {}) {
                    const serviceData = Array.isArray(data) ? data : [data];
                    const service = this.__container__[serviceRegistrationName];
                    const models = await service.create(serviceData, sharedContext);
                    const response = Array.isArray(data) ? models : models[0];
                    klassPrototype.aggregatedEvents.bind(this)({
                        action: event_bus_1.CommonEvents.CREATED,
                        object: (0, common_1.camelToSnakeCase)(modelName).toLowerCase(),
                        data: response,
                        context: sharedContext,
                    });
                    return await this.baseRepository_.serialize(response);
                };
                applyMethod(methodImplementation, 1);
                break;
            case "update":
                methodImplementation = async function (data = [], sharedContext = {}) {
                    const serviceData = Array.isArray(data) ? data : [data];
                    const service = this.__container__[serviceRegistrationName];
                    const models = await service.update(serviceData, sharedContext);
                    const response = models.length
                        ? Array.isArray(data)
                            ? models
                            : models[0]
                        : [];
                    klassPrototype.aggregatedEvents.bind(this)({
                        action: event_bus_1.CommonEvents.UPDATED,
                        object: (0, common_1.camelToSnakeCase)(modelName).toLowerCase(),
                        data: response,
                        context: sharedContext,
                    });
                    return await this.baseRepository_.serialize(response);
                };
                applyMethod(methodImplementation, 1);
                break;
            case "list":
                methodImplementation = async function (filters = {}, config = {}, sharedContext = {}) {
                    const service = this.__container__[serviceRegistrationName];
                    const models = await service.list(filters, config, sharedContext);
                    return await this.baseRepository_.serialize(models);
                };
                applyMethod(methodImplementation, 2);
                break;
            case "listAndCount":
                methodImplementation = async function (filters = {}, config = {}, sharedContext = {}) {
                    const [models, count] = await this.__container__[serviceRegistrationName].listAndCount(filters, config, sharedContext);
                    return [await this.baseRepository_.serialize(models), count];
                };
                applyMethod(methodImplementation, 2);
                break;
            case "delete":
                methodImplementation = async function (primaryKeyValues, sharedContext = {}) {
                    const primaryKeyValues_ = Array.isArray(primaryKeyValues)
                        ? primaryKeyValues
                        : [primaryKeyValues];
                    const ids = await this.__container__[serviceRegistrationName].delete(primaryKeyValues_, sharedContext);
                    ids.map((id) => klassPrototype.aggregatedEvents.bind(this)({
                        action: event_bus_1.CommonEvents.DELETED,
                        object: (0, common_1.camelToSnakeCase)(modelName).toLowerCase(),
                        data: (0, common_1.isString)(id) ? { id: id } : id,
                        context: sharedContext,
                    }));
                };
                applyMethod(methodImplementation, 1);
                break;
            case "softDelete":
                methodImplementation = async function (primaryKeyValues, config = {}, sharedContext = {}) {
                    const primaryKeyValues_ = Array.isArray(primaryKeyValues)
                        ? primaryKeyValues
                        : [primaryKeyValues];
                    const [, cascadedModelsMap] = await this.__container__[serviceRegistrationName].softDelete(primaryKeyValues_, sharedContext);
                    // Map internal table/column names to their respective external linkable keys
                    // eg: product.id = product_id, variant.id = variant_id
                    const mappedCascadedModelsMap = (0, common_1.mapObjectTo)(cascadedModelsMap, this[exports.MedusaServiceModelNameToLinkableKeysMapSymbol], {
                        pick: config.returnLinkableKeys,
                    });
                    if (mappedCascadedModelsMap) {
                        emitSoftDeleteRestoreEvents.bind(this)(klassPrototype, mappedCascadedModelsMap, event_bus_1.CommonEvents.DELETED, sharedContext);
                    }
                    return mappedCascadedModelsMap ? mappedCascadedModelsMap : void 0;
                };
                applyMethod(methodImplementation, 2);
                break;
            case "restore":
                methodImplementation = async function (primaryKeyValues, config = {}, sharedContext = {}) {
                    const primaryKeyValues_ = Array.isArray(primaryKeyValues)
                        ? primaryKeyValues
                        : [primaryKeyValues];
                    const [, cascadedModelsMap] = await this.__container__[serviceRegistrationName].restore(primaryKeyValues_, sharedContext);
                    let mappedCascadedModelsMap;
                    // Map internal table/column names to their respective external linkable keys
                    // eg: product.id = product_id, variant.id = variant_id
                    mappedCascadedModelsMap = (0, common_1.mapObjectTo)(cascadedModelsMap, this[exports.MedusaServiceModelNameToLinkableKeysMapSymbol], {
                        pick: config.returnLinkableKeys,
                    });
                    if (mappedCascadedModelsMap) {
                        emitSoftDeleteRestoreEvents.bind(this)(klassPrototype, mappedCascadedModelsMap, event_bus_1.CommonEvents.CREATED, sharedContext);
                    }
                    return mappedCascadedModelsMap ? mappedCascadedModelsMap : void 0;
                };
                applyMethod(methodImplementation, 2);
                break;
        }
    };
    class AbstractModuleService_ {
        constructor(container) {
            this[_a] = true;
            this.__container__ = container;
            this.baseRepository_ = container.baseRepository;
            const hasEventBusModuleService = Object.keys(this.__container__).find((key) => key === definition_1.Modules.EVENT_BUS);
            this.eventBusModuleService_ = hasEventBusModuleService
                ? this.__container__[definition_1.Modules.EVENT_BUS]
                : undefined;
            this[exports.MedusaServiceModelNameToLinkableKeysMapSymbol] =
                (0, joiner_config_builder_1.buildModelsNameToLinkableKeysMap)(this.__joinerConfig?.()?.linkableKeys ?? {});
        }
        /**
         * helper function to aggregate events. Will format the message properly and store in
         * the message aggregator from the context. The method must be decorated with `@EmitEvents`
         * @param action
         * @param object
         * @param eventName optional, can be inferred from the module joiner config + action + object
         * @param source optional, can be inferred from the module joiner config
         * @param data
         * @param context
         */
        aggregatedEvents({ action, object, eventName, source, data, context, }) {
            const __joinerConfig = (typeof this.__joinerConfig === "function"
                ? this.__joinerConfig()
                : this.__joinerConfig);
            const eventBuilder = (0, event_builder_factory_1.moduleEventBuilderFactory)({
                action,
                object,
                source: source || __joinerConfig.serviceName,
                eventName,
            });
            eventBuilder({
                data,
                sharedContext: context,
            });
        }
        /**
         * @internal this method is not meant to be used except by the internal team for now
         * @param groupedEvents
         * @protected
         */
        async emitEvents_(groupedEvents) {
            if (!this.eventBusModuleService_ || !groupedEvents) {
                return;
            }
            const promises = [];
            for (const group of Object.keys(groupedEvents)) {
                promises.push(this.eventBusModuleService_.emit(groupedEvents[group], {
                    internal: true,
                }));
            }
            await Promise.all(promises);
        }
    }
    _a = exports.MedusaServiceSymbol, _b = exports.MedusaServiceModelObjectsSymbol;
    AbstractModuleService_[_b] = models;
    /**
     * Build the retrieve/list/listAndCount/delete/softDelete/restore methods for all the other models
     */
    const modelsMethods = Object.entries(models).map(([name, config]) => [
        dml_1.DmlEntity.isDmlEntity(config) ? config.name : name,
        config,
        buildMethodNamesFromModel(name, config),
    ]);
    for (let [modelName, , modelMethods] of modelsMethods) {
        Object.entries(modelMethods).forEach(([method, methodName]) => {
            buildAndAssignMethodImpl(AbstractModuleService_.prototype, method, methodName, modelName);
        });
    }
    return AbstractModuleService_;
}
//# sourceMappingURL=medusa-service.js.map