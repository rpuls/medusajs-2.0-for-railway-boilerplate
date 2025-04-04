"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("@medusajs/framework/types");
const utils_1 = require("@medusajs/framework/utils");
const _models_1 = require("../models");
const _utils_1 = require("../utils");
const joiner_config_1 = require("../joiner-config");
const events_1 = require("../utils/events");
const generateMethodForModels = {
    FulfillmentSet: _models_1.FulfillmentSet,
    ServiceZone: _models_1.ServiceZone,
    ShippingOption: _models_1.ShippingOption,
    GeoZone: _models_1.GeoZone,
    ShippingProfile: _models_1.ShippingProfile,
    ShippingOptionRule: _models_1.ShippingOptionRule,
    ShippingOptionType: _models_1.ShippingOptionType,
    FulfillmentProvider: _models_1.FulfillmentProvider,
    // Not adding Fulfillment to not auto generate the methods under the hood and only provide the methods we want to expose8
};
class FulfillmentModuleService extends utils_1.ModulesSdkUtils.MedusaService(generateMethodForModels) {
    constructor({ baseRepository, fulfillmentSetService, serviceZoneService, geoZoneService, shippingProfileService, shippingOptionService, shippingOptionRuleService, shippingOptionTypeService, fulfillmentProviderService, fulfillmentService, fulfillmentAddressService, }, moduleDeclaration) {
        // @ts-ignore
        super(...arguments);
        this.moduleDeclaration = moduleDeclaration;
        this.baseRepository_ = baseRepository;
        this.fulfillmentSetService_ = fulfillmentSetService;
        this.serviceZoneService_ = serviceZoneService;
        this.geoZoneService_ = geoZoneService;
        this.shippingProfileService_ = shippingProfileService;
        this.shippingOptionService_ = shippingOptionService;
        this.shippingOptionRuleService_ = shippingOptionRuleService;
        this.shippingOptionTypeService_ = shippingOptionTypeService;
        this.fulfillmentProviderService_ = fulfillmentProviderService;
        this.fulfillmentService_ = fulfillmentService;
    }
    __joinerConfig() {
        return joiner_config_1.joinerConfig;
    }
    // @ts-ignore
    async listShippingOptions(filters = {}, config = {}, sharedContext = {}) {
        // Eventually, we could call normalizeListShippingOptionsForContextParams to translate the address and make a and condition with the other filters
        // In that case we could remote the address check below
        if (filters?.context || filters?.address) {
            return await this.listShippingOptionsForContext(filters, config, sharedContext);
        }
        return await super.listShippingOptions(filters, config, sharedContext);
    }
    async listShippingOptionsForContext(filters, config = {}, sharedContext = {}) {
        const { context, config: normalizedConfig, filters: normalizedFilters, } = FulfillmentModuleService.normalizeListShippingOptionsForContextParams(filters, config);
        let shippingOptions = await this.shippingOptionService_.list(normalizedFilters, normalizedConfig, sharedContext);
        if (context) {
            shippingOptions = shippingOptions.filter((shippingOption) => {
                if (!shippingOption.rules?.length) {
                    return true;
                }
                return (0, _utils_1.isContextValid)(context, shippingOption.rules.map((r) => r));
            });
        }
        return await this.baseRepository_.serialize(shippingOptions);
    }
    async retrieveFulfillment(id, config = {}, sharedContext = {}) {
        const fulfillment = await this.fulfillmentService_.retrieve(id, config, sharedContext);
        return await this.baseRepository_.serialize(fulfillment);
    }
    async listFulfillments(filters = {}, config = {}, sharedContext = {}) {
        const fulfillments = await this.fulfillmentService_.list(filters, config, sharedContext);
        return await this.baseRepository_.serialize(fulfillments);
    }
    async listAndCountFulfillments(filters, config, sharedContext = {}) {
        const [fulfillments, count] = await this.fulfillmentService_.listAndCount(filters, config, sharedContext);
        return [
            await this.baseRepository_.serialize(fulfillments),
            count,
        ];
    }
    // @ts-expect-error
    async createFulfillmentSets(data, sharedContext = {}) {
        const createdFulfillmentSets = await this.createFulfillmentSets_(data, sharedContext);
        const returnedFulfillmentSets = Array.isArray(data)
            ? createdFulfillmentSets
            : createdFulfillmentSets[0];
        return await this.baseRepository_.serialize(returnedFulfillmentSets);
    }
    async createFulfillmentSets_(data, sharedContext = {}) {
        const data_ = Array.isArray(data) ? data : [data];
        if (!data_.length) {
            return [];
        }
        for (const fulfillmentSet of data_) {
            if (fulfillmentSet.service_zones?.length) {
                for (const serviceZone of fulfillmentSet.service_zones) {
                    if (serviceZone.geo_zones?.length) {
                        FulfillmentModuleService.validateGeoZones(serviceZone.geo_zones);
                    }
                }
            }
        }
        const createdFulfillmentSets = await this.fulfillmentSetService_.create(data_, sharedContext);
        (0, _utils_1.buildCreatedFulfillmentSetEvents)({
            fulfillmentSets: createdFulfillmentSets,
            sharedContext,
        });
        return createdFulfillmentSets;
    }
    // @ts-expect-error
    async createServiceZones(data, sharedContext = {}) {
        const createdServiceZones = await this.createServiceZones_(data, sharedContext);
        return await this.baseRepository_.serialize(Array.isArray(data) ? createdServiceZones : createdServiceZones[0]);
    }
    async createServiceZones_(data, sharedContext = {}) {
        const data_ = Array.isArray(data) ? data : [data];
        if (!data_.length) {
            return [];
        }
        for (const serviceZone of data_) {
            if (serviceZone.geo_zones?.length) {
                if (serviceZone.geo_zones?.length) {
                    FulfillmentModuleService.validateGeoZones(serviceZone.geo_zones);
                }
            }
        }
        const createdServiceZones = await this.serviceZoneService_.create(data_, sharedContext);
        (0, _utils_1.buildCreatedServiceZoneEvents)({
            serviceZones: createdServiceZones,
            sharedContext,
        });
        return createdServiceZones;
    }
    // @ts-expect-error
    async createShippingOptions(data, sharedContext = {}) {
        const createdShippingOptions = await this.createShippingOptions_(data, sharedContext);
        return await this.baseRepository_.serialize(Array.isArray(data) ? createdShippingOptions : createdShippingOptions[0]);
    }
    async createShippingOptions_(data, sharedContext = {}) {
        const data_ = Array.isArray(data) ? data : [data];
        if (!data_.length) {
            return [];
        }
        const rules = data_.flatMap((d) => d.rules).filter(Boolean);
        if (rules.length) {
            (0, _utils_1.validateAndNormalizeRules)(rules);
        }
        const createdSO = await this.shippingOptionService_.create(data_, sharedContext);
        (0, events_1.buildCreatedShippingOptionEvents)({
            shippingOptions: createdSO,
            sharedContext,
        });
        return createdSO;
    }
    // @ts-expect-error
    async createShippingProfiles(data, sharedContext = {}) {
        const createdShippingProfiles = await this.createShippingProfiles_(data, sharedContext);
        _utils_1.eventBuilders.createdShippingProfile({
            data: createdShippingProfiles,
            sharedContext,
        });
        return await this.baseRepository_.serialize(Array.isArray(data) ? createdShippingProfiles : createdShippingProfiles[0]);
    }
    async createShippingProfiles_(data, sharedContext = {}) {
        const data_ = Array.isArray(data) ? data : [data];
        if (!data_.length) {
            return [];
        }
        return await this.shippingProfileService_.create(data_, sharedContext);
    }
    // @ts-expect-error
    async createGeoZones(data, sharedContext = {}) {
        const data_ = Array.isArray(data) ? data : [data];
        FulfillmentModuleService.validateGeoZones(data_);
        const createdGeoZones = await this.geoZoneService_.create(data_, sharedContext);
        _utils_1.eventBuilders.createdGeoZone({
            data: createdGeoZones,
            sharedContext,
        });
        return await this.baseRepository_.serialize(Array.isArray(data) ? createdGeoZones : createdGeoZones[0]);
    }
    // @ts-expect-error
    async createShippingOptionRules(data, sharedContext = {}) {
        const createdShippingOptionRules = await this.createShippingOptionRules_(data, sharedContext);
        return await this.baseRepository_.serialize(Array.isArray(data)
            ? createdShippingOptionRules
            : createdShippingOptionRules[0]);
    }
    async createShippingOptionRules_(data, sharedContext = {}) {
        const data_ = Array.isArray(data) ? data : [data];
        if (!data_.length) {
            return [];
        }
        (0, _utils_1.validateAndNormalizeRules)(data_);
        const createdSORules = await this.shippingOptionRuleService_.create(data_, sharedContext);
        _utils_1.eventBuilders.createdShippingOptionRule({
            data: createdSORules.map((sor) => ({ id: sor.id })),
            sharedContext,
        });
        return createdSORules;
    }
    async createFulfillment(data, sharedContext = {}) {
        const { order, ...fulfillmentDataToCreate } = data;
        const fulfillment = await this.fulfillmentService_.create(fulfillmentDataToCreate, sharedContext);
        const { items, data: fulfillmentData, provider_id, ...fulfillmentRest } = fulfillment;
        try {
            const providerResult = await this.fulfillmentProviderService_.createFulfillment(provider_id, // TODO: should we add a runtime check on provider_id being provided?
            fulfillmentData || {}, items.map((i) => i), order, fulfillmentRest);
            await this.fulfillmentService_.update({
                id: fulfillment.id,
                data: providerResult.data ?? {},
                labels: providerResult.labels ?? [],
            }, sharedContext);
        }
        catch (error) {
            await this.fulfillmentService_.delete(fulfillment.id, sharedContext);
            throw error;
        }
        (0, _utils_1.buildCreatedFulfillmentEvents)({
            fulfillments: [fulfillment],
            sharedContext,
        });
        return await this.baseRepository_.serialize(fulfillment);
    }
    async deleteFulfillment(id, sharedContext = {}) {
        const fulfillment = await this.fulfillmentService_.retrieve(id, {}, sharedContext);
        if (!(0, utils_1.isPresent)(fulfillment.canceled_at)) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Fulfillment with id ${fulfillment.id} needs to be canceled first before deleting`);
        }
        await this.fulfillmentService_.delete(id, sharedContext);
    }
    async createReturnFulfillment(data, sharedContext = {}) {
        const { order, ...fulfillmentDataToCreate } = data;
        const fulfillment = await this.fulfillmentService_.create(fulfillmentDataToCreate, sharedContext);
        const shippingOption = await this.shippingOptionService_.retrieve(fulfillment.shipping_option_id, {
            select: ["id", "name", "data", "metadata"],
        }, sharedContext);
        try {
            const providerResult = await this.fulfillmentProviderService_.createReturn(fulfillment.provider_id, // TODO: should we add a runtime check on provider_id being provided?,
            {
                ...fulfillment,
                shipping_option: shippingOption,
            });
            await this.fulfillmentService_.update({
                id: fulfillment.id,
                data: providerResult.data ?? {},
                labels: providerResult.labels ?? [],
            }, sharedContext);
        }
        catch (error) {
            await this.fulfillmentService_.delete(fulfillment.id, sharedContext);
            throw error;
        }
        (0, _utils_1.buildCreatedFulfillmentEvents)({
            fulfillments: [fulfillment],
            sharedContext,
        });
        return await this.baseRepository_.serialize(fulfillment);
    }
    // @ts-expect-error
    async updateFulfillmentSets(data, sharedContext = {}) {
        const updatedFulfillmentSets = await this.updateFulfillmentSets_(data, sharedContext);
        return await this.baseRepository_.serialize(updatedFulfillmentSets);
    }
    async updateFulfillmentSets_(data, sharedContext = {}) {
        const data_ = Array.isArray(data) ? data : [data];
        if (!data_.length) {
            return [];
        }
        const fulfillmentSetIds = data_.map((f) => f.id);
        if (!fulfillmentSetIds.length) {
            return [];
        }
        const fulfillmentSets = await this.fulfillmentSetService_.list({
            id: fulfillmentSetIds,
        }, {
            relations: ["service_zones", "service_zones.geo_zones"],
            take: fulfillmentSetIds.length,
        }, sharedContext);
        const fulfillmentSetSet = new Set(fulfillmentSets.map((f) => f.id));
        const expectedFulfillmentSetSet = new Set(data_.map((f) => f.id));
        const missingFulfillmentSetIds = (0, utils_1.getSetDifference)(expectedFulfillmentSetSet, fulfillmentSetSet);
        if (missingFulfillmentSetIds.size) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `The following fulfillment sets does not exists: ${Array.from(missingFulfillmentSetIds).join(", ")}`);
        }
        const fulfillmentSetMap = new Map(fulfillmentSets.map((f) => [f.id, f]));
        const serviceZoneIdsToDelete = [];
        const geoZoneIdsToDelete = [];
        const existingServiceZoneIds = [];
        const existingGeoZoneIds = [];
        data_.forEach((fulfillmentSet) => {
            if (fulfillmentSet.service_zones) {
                /**
                 * Detect and delete service zones that are not in the updated
                 */
                const existingFulfillmentSet = fulfillmentSetMap.get(fulfillmentSet.id);
                const existingServiceZones = existingFulfillmentSet.service_zones;
                const updatedServiceZones = fulfillmentSet.service_zones;
                const toDeleteServiceZoneIds = (0, utils_1.getSetDifference)(new Set(existingServiceZones.map((s) => s.id)), new Set(updatedServiceZones
                    .map((s) => "id" in s && s.id)
                    .filter((id) => !!id)));
                if (toDeleteServiceZoneIds.size) {
                    serviceZoneIdsToDelete.push(...Array.from(toDeleteServiceZoneIds));
                    geoZoneIdsToDelete.push(...existingServiceZones
                        .filter((s) => toDeleteServiceZoneIds.has(s.id))
                        .flatMap((s) => s.geo_zones.map((g) => g.id)));
                }
                /**
                 * Detect and re assign service zones to the fulfillment set that are still present
                 */
                const serviceZonesMap = new Map(existingFulfillmentSet.service_zones.map((serviceZone) => [
                    serviceZone.id,
                    serviceZone,
                ]));
                const serviceZonesSet = new Set(existingServiceZones
                    .map((s) => "id" in s && s.id)
                    .filter((id) => !!id));
                const expectedServiceZoneSet = new Set(fulfillmentSet.service_zones
                    .map((s) => "id" in s && s.id)
                    .filter((id) => !!id));
                const missingServiceZoneIds = (0, utils_1.getSetDifference)(expectedServiceZoneSet, serviceZonesSet);
                if (missingServiceZoneIds.size) {
                    throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `The following service zones does not exists: ${Array.from(missingServiceZoneIds).join(", ")}`);
                }
                // re assign service zones to the fulfillment set
                if (fulfillmentSet.service_zones) {
                    fulfillmentSet.service_zones = fulfillmentSet.service_zones.map((serviceZone) => {
                        if (!("id" in serviceZone)) {
                            if (serviceZone.geo_zones?.length) {
                                FulfillmentModuleService.validateGeoZones(serviceZone.geo_zones);
                            }
                            return serviceZone;
                        }
                        const existingServiceZone = serviceZonesMap.get(serviceZone.id);
                        existingServiceZoneIds.push(existingServiceZone.id);
                        if (existingServiceZone.geo_zones.length) {
                            existingGeoZoneIds.push(...existingServiceZone.geo_zones.map((g) => g.id));
                        }
                        return serviceZonesMap.get(serviceZone.id);
                    });
                }
            }
        });
        if (serviceZoneIdsToDelete.length) {
            _utils_1.eventBuilders.deletedServiceZone({
                data: serviceZoneIdsToDelete.map((id) => ({ id })),
                sharedContext,
            });
            _utils_1.eventBuilders.deletedGeoZone({
                data: geoZoneIdsToDelete.map((id) => ({ id })),
                sharedContext,
            });
            await (0, utils_1.promiseAll)([
                this.geoZoneService_.delete({
                    id: geoZoneIdsToDelete,
                }, sharedContext),
                this.serviceZoneService_.delete({
                    id: serviceZoneIdsToDelete,
                }, sharedContext),
            ]);
        }
        const updatedFulfillmentSets = await this.fulfillmentSetService_.update(data_, sharedContext);
        _utils_1.eventBuilders.updatedFulfillmentSet({
            data: updatedFulfillmentSets,
            sharedContext,
        });
        const createdServiceZoneIds = [];
        const createdGeoZoneIds = updatedFulfillmentSets
            .flatMap((f) => [...f.service_zones].flatMap((serviceZone) => {
            if (!existingServiceZoneIds.includes(serviceZone.id)) {
                createdServiceZoneIds.push(serviceZone.id);
            }
            return serviceZone.geo_zones.map((g) => g.id);
        }))
            .filter((id) => !existingGeoZoneIds.includes(id));
        _utils_1.eventBuilders.createdServiceZone({
            data: createdServiceZoneIds.map((id) => ({ id })),
            sharedContext,
        });
        _utils_1.eventBuilders.createdGeoZone({
            data: createdGeoZoneIds.map((id) => ({ id })),
            sharedContext,
        });
        return Array.isArray(data)
            ? updatedFulfillmentSets
            : updatedFulfillmentSets[0];
    }
    // @ts-expect-error
    async updateServiceZones(idOrSelector, data, sharedContext = {}) {
        const normalizedInput = [];
        if ((0, utils_1.isString)(idOrSelector)) {
            normalizedInput.push({ id: idOrSelector, ...data });
        }
        else {
            const serviceZones = await this.serviceZoneService_.list({ ...idOrSelector }, {}, sharedContext);
            if (!serviceZones.length) {
                return [];
            }
            for (const serviceZone of serviceZones) {
                normalizedInput.push({ id: serviceZone.id, ...data });
            }
        }
        const updatedServiceZones = await this.updateServiceZones_(normalizedInput, sharedContext);
        const toReturn = (0, utils_1.isString)(idOrSelector)
            ? updatedServiceZones[0]
            : updatedServiceZones;
        return await this.baseRepository_.serialize(toReturn);
    }
    async updateServiceZones_(data, sharedContext = {}) {
        const data_ = Array.isArray(data) ? data : [data];
        if (!data_.length) {
            return [];
        }
        const serviceZoneIds = data_.map((s) => s.id);
        if (!serviceZoneIds.length) {
            return [];
        }
        const serviceZones = await this.serviceZoneService_.list({
            id: serviceZoneIds,
        }, {
            relations: ["geo_zones"],
            take: serviceZoneIds.length,
        }, sharedContext);
        const serviceZoneSet = new Set(serviceZones.map((s) => s.id));
        const expectedServiceZoneSet = new Set(data_.map((s) => s.id));
        const missingServiceZoneIds = (0, utils_1.getSetDifference)(expectedServiceZoneSet, serviceZoneSet);
        if (missingServiceZoneIds.size) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `The following service zones does not exists: ${Array.from(missingServiceZoneIds).join(", ")}`);
        }
        const serviceZoneMap = new Map(serviceZones.map((s) => [s.id, s]));
        const geoZoneIdsToDelete = [];
        const existingGeoZoneIds = [];
        const updatedGeoZoneIds = [];
        data_.forEach((serviceZone) => {
            if (serviceZone.geo_zones) {
                const existingServiceZone = serviceZoneMap.get(serviceZone.id);
                const existingGeoZones = existingServiceZone.geo_zones;
                const updatedGeoZones = serviceZone.geo_zones;
                const existingGeoZoneIdsForServiceZone = existingGeoZones.map((g) => g.id);
                const toDeleteGeoZoneIds = (0, utils_1.getSetDifference)(new Set(existingGeoZoneIdsForServiceZone), new Set(updatedGeoZones
                    .map((g) => "id" in g && g.id)
                    .filter((id) => !!id)));
                existingGeoZoneIds.push(...existingGeoZoneIdsForServiceZone);
                if (toDeleteGeoZoneIds.size) {
                    geoZoneIdsToDelete.push(...Array.from(toDeleteGeoZoneIds));
                }
                const geoZonesMap = new Map(existingServiceZone.geo_zones.map((geoZone) => [geoZone.id, geoZone]));
                const geoZonesSet = new Set(existingGeoZones
                    .map((g) => "id" in g && g.id)
                    .filter((id) => !!id));
                const expectedGeoZoneSet = new Set(serviceZone.geo_zones
                    .map((g) => "id" in g && g.id)
                    .filter((id) => !!id));
                const missingGeoZoneIds = (0, utils_1.getSetDifference)(expectedGeoZoneSet, geoZonesSet);
                if (missingGeoZoneIds.size) {
                    throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `The following geo zones does not exists: ${Array.from(missingGeoZoneIds).join(", ")}`);
                }
                serviceZone.geo_zones = serviceZone.geo_zones.map((geoZone) => {
                    if (!("id" in geoZone)) {
                        FulfillmentModuleService.validateGeoZones([geoZone]);
                        return geoZone;
                    }
                    const existing = geoZonesMap.get(geoZone.id);
                    // If only the id is provided we dont consider it as an update
                    if (Object.keys(geoZone).length > 1 &&
                        !(0, utils_1.deepEqualObj)(existing, geoZone)) {
                        updatedGeoZoneIds.push(geoZone.id);
                    }
                    return { ...existing, ...geoZone };
                });
            }
        });
        if (geoZoneIdsToDelete.length) {
            _utils_1.eventBuilders.deletedGeoZone({
                data: geoZoneIdsToDelete.map((id) => ({ id })),
                sharedContext,
            });
            await this.geoZoneService_.delete({
                id: geoZoneIdsToDelete,
            }, sharedContext);
        }
        const updatedServiceZones = await this.serviceZoneService_.update(data_, sharedContext);
        _utils_1.eventBuilders.updatedServiceZone({
            data: updatedServiceZones,
            sharedContext,
        });
        const createdGeoZoneIds = updatedServiceZones
            .flatMap((serviceZone) => {
            return serviceZone.geo_zones.map((g) => g.id);
        })
            .filter((id) => !existingGeoZoneIds.includes(id));
        _utils_1.eventBuilders.createdGeoZone({
            data: createdGeoZoneIds.map((id) => ({ id })),
            sharedContext,
        });
        _utils_1.eventBuilders.updatedGeoZone({
            data: updatedGeoZoneIds.map((id) => ({ id })),
            sharedContext,
        });
        return Array.isArray(data) ? updatedServiceZones : updatedServiceZones[0];
    }
    async upsertServiceZones(data, sharedContext = {}) {
        const upsertServiceZones = await this.upsertServiceZones_(data, sharedContext);
        const allServiceZones = await this.baseRepository_.serialize(upsertServiceZones);
        return Array.isArray(data) ? allServiceZones : allServiceZones[0];
    }
    async upsertServiceZones_(data, sharedContext = {}) {
        const input = Array.isArray(data) ? data : [data];
        const forUpdate = input.filter((serviceZone) => !!serviceZone.id);
        const forCreate = input.filter((serviceZone) => !serviceZone.id);
        const created = [];
        const updated = [];
        if (forCreate.length) {
            const createdServiceZones = await this.createServiceZones_(forCreate, sharedContext);
            const toPush = Array.isArray(createdServiceZones)
                ? createdServiceZones
                : [createdServiceZones];
            created.push(...toPush);
        }
        if (forUpdate.length) {
            const updatedServiceZones = await this.updateServiceZones_(forUpdate, sharedContext);
            const toPush = Array.isArray(updatedServiceZones)
                ? updatedServiceZones
                : [updatedServiceZones];
            updated.push(...toPush);
        }
        return [...created, ...updated];
    }
    // @ts-expect-error
    async updateShippingOptions(idOrSelector, data, sharedContext = {}) {
        const normalizedInput = [];
        if ((0, utils_1.isString)(idOrSelector)) {
            normalizedInput.push({ id: idOrSelector, ...data });
        }
        else {
            const shippingOptions = await this.shippingOptionService_.list(idOrSelector, {}, sharedContext);
            shippingOptions.forEach((shippingOption) => {
                normalizedInput.push({ id: shippingOption.id, ...data });
            });
        }
        const updatedShippingOptions = await this.updateShippingOptions_(normalizedInput, sharedContext);
        const serialized = await this.baseRepository_.serialize(updatedShippingOptions);
        return (0, utils_1.isString)(idOrSelector) ? serialized[0] : serialized;
    }
    async updateShippingOptions_(data, sharedContext = {}) {
        const dataArray = Array.isArray(data)
            ? data.map((d) => (0, utils_1.deepCopy)(d))
            : [(0, utils_1.deepCopy)(data)];
        if (!dataArray.length) {
            return [];
        }
        const shippingOptionIds = dataArray.map((s) => s.id);
        if (!shippingOptionIds.length) {
            return [];
        }
        const shippingOptions = await this.shippingOptionService_.list({
            id: shippingOptionIds,
        }, {
            relations: ["rules", "type"],
            take: shippingOptionIds.length,
        }, sharedContext);
        const existingShippingOptions = new Map(shippingOptions.map((s) => [s.id, s]));
        FulfillmentModuleService.validateMissingShippingOptions_(shippingOptions, dataArray);
        const ruleIdsToDelete = [];
        const updatedRuleIds = [];
        const existingRuleIds = [];
        const optionTypeDeletedIds = [];
        dataArray.forEach((shippingOption) => {
            const existingShippingOption = existingShippingOptions.get(shippingOption.id); // Garuantueed to exist since the validation above have been performed
            if (shippingOption.type && !("id" in shippingOption.type)) {
                optionTypeDeletedIds.push(existingShippingOption.type.id);
            }
            if (!shippingOption.rules) {
                return;
            }
            const existingRules = existingShippingOption.rules;
            existingRuleIds.push(...existingRules.map((r) => r.id));
            FulfillmentModuleService.validateMissingShippingOptionRules(existingShippingOption, shippingOption);
            const existingRulesMap = new Map(existingRules.map((rule) => [rule.id, rule]));
            const updatedRules = shippingOption.rules
                .map((rule) => {
                if ("id" in rule) {
                    const existingRule = (existingRulesMap.get(rule.id) ??
                        {});
                    if (existingRulesMap.get(rule.id)) {
                        updatedRuleIds.push(rule.id);
                    }
                    // @ts-ignore
                    delete rule.created_at;
                    // @ts-ignore
                    delete rule.updated_at;
                    // @ts-ignore
                    delete rule.deleted_at;
                    const ruleData = {
                        ...existingRule,
                        ...rule,
                    };
                    existingRulesMap.set(rule.id, ruleData);
                    return ruleData;
                }
                return;
            })
                .filter(Boolean);
            (0, _utils_1.validateAndNormalizeRules)(updatedRules);
            const toDeleteRuleIds = (0, utils_1.arrayDifference)(updatedRuleIds, Array.from(existingRulesMap.keys()));
            if (toDeleteRuleIds.length) {
                ruleIdsToDelete.push(...toDeleteRuleIds);
            }
            shippingOption.rules = shippingOption.rules.map((rule) => {
                if (!("id" in rule)) {
                    (0, _utils_1.validateAndNormalizeRules)([rule]);
                    return rule;
                }
                return existingRulesMap.get(rule.id);
            });
        });
        if (ruleIdsToDelete.length) {
            _utils_1.eventBuilders.deletedShippingOptionRule({
                data: ruleIdsToDelete.map((id) => ({ id })),
                sharedContext,
            });
            await this.shippingOptionRuleService_.delete(ruleIdsToDelete, sharedContext);
        }
        const updatedShippingOptions = await this.shippingOptionService_.update(dataArray, sharedContext);
        this.handleShippingOptionUpdateEvents({
            shippingOptionsData: dataArray,
            updatedShippingOptions,
            optionTypeDeletedIds,
            updatedRuleIds,
            existingRuleIds,
            sharedContext,
        });
        return Array.isArray(data)
            ? updatedShippingOptions
            : updatedShippingOptions[0];
    }
    handleShippingOptionUpdateEvents({ shippingOptionsData, updatedShippingOptions, optionTypeDeletedIds, updatedRuleIds, existingRuleIds, sharedContext, }) {
        _utils_1.eventBuilders.updatedShippingOption({
            data: updatedShippingOptions,
            sharedContext,
        });
        _utils_1.eventBuilders.deletedShippingOptionType({
            data: optionTypeDeletedIds.map((id) => ({ id })),
            sharedContext,
        });
        const createdOptionTypeIds = updatedShippingOptions
            .filter((so) => {
            const updateData = shippingOptionsData.find((sod) => sod.id === so.id);
            return updateData?.type && !("id" in updateData.type);
        })
            .map((so) => so.type.id);
        _utils_1.eventBuilders.createdShippingOptionType({
            data: createdOptionTypeIds.map((id) => ({ id })),
            sharedContext,
        });
        const createdRuleIds = updatedShippingOptions
            .flatMap((so) => [...so.rules].map((rule) => {
            if (existingRuleIds.includes(rule.id)) {
                return;
            }
            return rule.id;
        }))
            .filter((id) => !!id);
        _utils_1.eventBuilders.createdShippingOptionRule({
            data: createdRuleIds.map((id) => ({ id })),
            sharedContext,
        });
        _utils_1.eventBuilders.updatedShippingOptionRule({
            data: updatedRuleIds.map((id) => ({ id })),
            sharedContext,
        });
    }
    async upsertShippingOptions(data, sharedContext = {}) {
        const upsertedShippingOptions = await this.upsertShippingOptions_(data, sharedContext);
        const allShippingOptions = await this.baseRepository_.serialize(upsertedShippingOptions);
        return Array.isArray(data) ? allShippingOptions : allShippingOptions[0];
    }
    async upsertShippingOptions_(data, sharedContext = {}) {
        const input = Array.isArray(data) ? data : [data];
        const forUpdate = input.filter((shippingOption) => !!shippingOption.id);
        const forCreate = input.filter((shippingOption) => !shippingOption.id);
        let created = [];
        let updated = [];
        if (forCreate.length) {
            const createdShippingOptions = await this.createShippingOptions_(forCreate, sharedContext);
            const toPush = Array.isArray(createdShippingOptions)
                ? createdShippingOptions
                : [createdShippingOptions];
            created.push(...toPush);
        }
        if (forUpdate.length) {
            const updatedShippingOptions = await this.updateShippingOptions_(forUpdate, sharedContext);
            const toPush = Array.isArray(updatedShippingOptions)
                ? updatedShippingOptions
                : [updatedShippingOptions];
            updated.push(...toPush);
        }
        return [...created, ...updated];
    }
    // @ts-expect-error
    async updateShippingProfiles(idOrSelector, data, sharedContext = {}) {
        let normalizedInput = [];
        if ((0, utils_1.isString)(idOrSelector)) {
            await this.shippingProfileService_.retrieve(idOrSelector, {}, sharedContext);
            normalizedInput = [{ id: idOrSelector, ...data }];
        }
        else {
            const profiles = await this.shippingProfileService_.list(idOrSelector, {}, sharedContext);
            normalizedInput = profiles.map((profile) => ({
                id: profile.id,
                ...data,
            }));
        }
        const profiles = await this.shippingProfileService_.update(normalizedInput, sharedContext);
        const updatedProfiles = await this.baseRepository_.serialize(profiles);
        return (0, utils_1.isString)(idOrSelector) ? updatedProfiles[0] : updatedProfiles;
    }
    async upsertShippingProfiles(data, sharedContext = {}) {
        const input = Array.isArray(data) ? data : [data];
        const forUpdate = input.filter((prof) => !!prof.id);
        const forCreate = input.filter((prof) => !prof.id);
        let created = [];
        let updated = [];
        if (forCreate.length) {
            created = await this.shippingProfileService_.create(forCreate, sharedContext);
        }
        if (forUpdate.length) {
            updated = await this.shippingProfileService_.update(forUpdate, sharedContext);
        }
        const result = [...created, ...updated];
        const allProfiles = await this.baseRepository_.serialize(result);
        return Array.isArray(data) ? allProfiles : allProfiles[0];
    }
    // @ts-expect-error
    async updateGeoZones(data, sharedContext = {}) {
        const data_ = Array.isArray(data) ? data : [data];
        if (!data_.length) {
            return [];
        }
        FulfillmentModuleService.validateGeoZones(data_);
        const updatedGeoZones = await this.geoZoneService_.update(data_, sharedContext);
        _utils_1.eventBuilders.updatedGeoZone({
            data: updatedGeoZones,
            sharedContext,
        });
        const serialized = await this.baseRepository_.serialize(updatedGeoZones);
        return Array.isArray(data) ? serialized : serialized[0];
    }
    // @ts-expect-error
    async updateShippingOptionRules(data, sharedContext = {}) {
        const updatedShippingOptionRules = await this.updateShippingOptionRules_(data, sharedContext);
        return await this.baseRepository_.serialize(updatedShippingOptionRules);
    }
    async updateShippingOptionRules_(data, sharedContext = {}) {
        const data_ = Array.isArray(data) ? data : [data];
        if (!data_.length) {
            return [];
        }
        (0, _utils_1.validateAndNormalizeRules)(data_);
        const updatedShippingOptionRules = await this.shippingOptionRuleService_.update(data_, sharedContext);
        _utils_1.eventBuilders.updatedShippingOptionRule({
            data: updatedShippingOptionRules.map((rule) => ({ id: rule.id })),
            sharedContext,
        });
        return Array.isArray(data)
            ? updatedShippingOptionRules
            : updatedShippingOptionRules[0];
    }
    async updateFulfillment(id, data, sharedContext = {}) {
        const fulfillment = await this.updateFulfillment_(id, data, sharedContext);
        return await this.baseRepository_.serialize(fulfillment);
    }
    async updateFulfillment_(id, data, sharedContext) {
        const existingFulfillment = await this.fulfillmentService_.retrieve(id, {
            relations: ["items", "labels"],
        }, sharedContext);
        const updatedLabelIds = [];
        let deletedLabelIds = [];
        const existingLabelIds = existingFulfillment.labels.map((label) => label.id);
        /**
         * @note
         * Since the relation is a one to many, the deletion, update and creation of labels
         * is handled b the orm. That means that we dont have to perform any manual deletions or update.
         * For some reason we use to have upsert and replace handled manually but we could simplify all that just like
         * we do below which will create the label, update some and delete the one that does not exists in the new data.
         *
         * There is a bit of logic as we need to reassign the data of those we want to keep
         * and we also need to emit the events later on.
         */
        if ((0, utils_1.isDefined)(data.labels) && (0, utils_1.isPresent)(data.labels)) {
            const dataLabelIds = data.labels
                .filter((label) => "id" in label)
                .map((label) => label.id);
            deletedLabelIds = (0, utils_1.arrayDifference)(existingLabelIds, dataLabelIds);
            for (let label of data.labels) {
                if (!("id" in label)) {
                    continue;
                }
                const existingLabel = existingFulfillment.labels.find(({ id }) => id === label.id);
                if (!existingLabel ||
                    Object.keys(label).length === 1 ||
                    (0, utils_1.deepEqualObj)(existingLabel, label)) {
                    continue;
                }
                updatedLabelIds.push(label.id);
                const labelData = { ...label };
                Object.assign(label, existingLabel, labelData);
            }
        }
        const [fulfillment] = await this.fulfillmentService_.update([{ id, ...data }], sharedContext);
        this.handleFulfillmentUpdateEvents(fulfillment, existingLabelIds, updatedLabelIds, deletedLabelIds, sharedContext);
        return fulfillment;
    }
    handleFulfillmentUpdateEvents(fulfillment, existingLabelIds, updatedLabelIds, deletedLabelIds, sharedContext) {
        _utils_1.eventBuilders.updatedFulfillment({
            data: [{ id: fulfillment.id }],
            sharedContext,
        });
        _utils_1.eventBuilders.deletedFulfillmentLabel({
            data: deletedLabelIds.map((id) => ({ id })),
            sharedContext,
        });
        _utils_1.eventBuilders.updatedFulfillmentLabel({
            data: updatedLabelIds.map((id) => ({ id })),
            sharedContext,
        });
        const createdLabels = fulfillment.labels.filter((label) => {
            return !existingLabelIds.includes(label.id);
        });
        _utils_1.eventBuilders.createdFulfillmentLabel({
            data: createdLabels.map((label) => ({ id: label.id })),
            sharedContext,
        });
    }
    async cancelFulfillment(id, sharedContext = {}) {
        const canceledAt = new Date();
        let fulfillment = await this.fulfillmentService_.retrieve(id, {}, sharedContext);
        FulfillmentModuleService.canCancelFulfillmentOrThrow(fulfillment);
        // Make this action idempotent
        if (!fulfillment.canceled_at) {
            try {
                await this.fulfillmentProviderService_.cancelFulfillment(fulfillment.provider_id, // TODO: should we add a runtime check on provider_id being provided?,
                fulfillment.data ?? {});
            }
            catch (error) {
                throw error;
            }
            fulfillment = await this.fulfillmentService_.update({
                id,
                canceled_at: canceledAt,
            }, sharedContext);
            _utils_1.eventBuilders.updatedFulfillment({
                data: [{ id }],
                sharedContext,
            });
        }
        const result = await this.baseRepository_.serialize(fulfillment);
        return Array.isArray(result) ? result[0] : result;
    }
    async retrieveFulfillmentOptions(providerId) {
        return await this.fulfillmentProviderService_.getFulfillmentOptions(providerId);
    }
    async validateFulfillmentData(providerId, optionData, data, context) {
        return await this.fulfillmentProviderService_.validateFulfillmentData(providerId, optionData, data, context);
    }
    // TODO: seems not to be used, what is the purpose of this method?
    async validateFulfillmentOption(providerId, data) {
        return await this.fulfillmentProviderService_.validateOption(providerId, data);
    }
    async validateShippingOption(shippingOptionId, context = {}, sharedContext = {}) {
        const shippingOptions = await this.listShippingOptionsForContext({ id: shippingOptionId, context }, {
            relations: ["rules"],
        }, sharedContext);
        return !!shippingOptions.length;
    }
    async validateShippingOptionsForPriceCalculation(shippingOptionsData, sharedContext = {}) {
        const nonCalculatedOptions = shippingOptionsData.filter((option) => option.price_type !== "calculated");
        if (nonCalculatedOptions.length) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Cannot calculate price for non-calculated shipping options: ${nonCalculatedOptions
                .map((o) => o.name)
                .join(", ")}`);
        }
        const promises = shippingOptionsData.map((option) => this.fulfillmentProviderService_.canCalculate(option.provider_id, option));
        return await (0, utils_1.promiseAll)(promises);
    }
    async calculateShippingOptionsPrices(shippingOptionsData) {
        const promises = shippingOptionsData.map((data) => this.fulfillmentProviderService_.calculatePrice(data.provider_id, data.optionData, data.data, data.context));
        return await (0, utils_1.promiseAll)(promises);
    }
    // @ts-expect-error
    async deleteShippingProfiles(ids, sharedContext = {}) {
        const shippingProfileIds = Array.isArray(ids) ? ids : [ids];
        await this.validateShippingProfileDeletion(shippingProfileIds, sharedContext);
        return await super.deleteShippingProfiles(shippingProfileIds, sharedContext);
    }
    // @ts-expect-error
    async softDeleteShippingProfiles(ids, config, sharedContext = {}) {
        await this.validateShippingProfileDeletion(ids, sharedContext);
        return await super.softDeleteShippingProfiles(ids, config, sharedContext);
    }
    async validateShippingProfileDeletion(ids, sharedContext) {
        const shippingProfileIds = Array.isArray(ids) ? ids : [ids];
        const shippingProfiles = await this.shippingProfileService_.list({ id: shippingProfileIds }, {
            relations: ["shipping_options.id"],
        }, sharedContext);
        const undeletableShippingProfiles = shippingProfiles.filter((profile) => profile.shipping_options.length > 0);
        if (undeletableShippingProfiles.length) {
            const undeletableShippingProfileIds = undeletableShippingProfiles.map((profile) => profile.id);
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Cannot delete Shipping Profiles ${undeletableShippingProfileIds} with associated Shipping Options. Delete Shipping Options first and try again.`);
        }
    }
    static canCancelFulfillmentOrThrow(fulfillment) {
        if (fulfillment.shipped_at) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Fulfillment with id ${fulfillment.id} already shipped`);
        }
        if (fulfillment.delivered_at) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Fulfillment with id ${fulfillment.id} already delivered`);
        }
        return true;
    }
    static validateMissingShippingOptions_(shippingOptions, shippingOptionsData) {
        const missingShippingOptionIds = (0, utils_1.arrayDifference)(shippingOptionsData.map((s) => s.id), shippingOptions.map((s) => s.id));
        if (missingShippingOptionIds.length) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `The following shipping options do not exist: ${Array.from(missingShippingOptionIds).join(", ")}`);
        }
    }
    static validateMissingShippingOptionRules(shippingOption, shippingOptionUpdateData) {
        if (!shippingOptionUpdateData.rules) {
            return;
        }
        const existingRules = shippingOption.rules;
        const rulesSet = new Set(existingRules.map((r) => r.id));
        // Only validate the rules that have an id to validate that they really exists in the shipping option
        const expectedRuleSet = new Set(shippingOptionUpdateData.rules
            .map((r) => "id" in r && r.id)
            .filter((id) => !!id));
        const nonAlreadyExistingRules = (0, utils_1.getSetDifference)(expectedRuleSet, rulesSet);
        if (nonAlreadyExistingRules.size) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `The following rules does not exists: ${Array.from(nonAlreadyExistingRules).join(", ")} on shipping option ${shippingOptionUpdateData.id}`);
        }
    }
    static validateGeoZones(geoZones) {
        const requirePropForType = {
            country: ["country_code"],
            province: ["country_code", "province_code"],
            city: ["country_code", "province_code", "city"],
            zip: ["country_code", "province_code", "city", "postal_expression"],
        };
        for (const geoZone of geoZones) {
            if (!requirePropForType[geoZone.type]) {
                throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Invalid geo zone type: ${geoZone.type}`);
            }
            for (const prop of requirePropForType[geoZone.type]) {
                if (!geoZone[prop]) {
                    throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Missing required property ${prop} for geo zone type ${geoZone.type}`);
                }
            }
        }
    }
    static normalizeListShippingOptionsForContextParams(filters, config = {}) {
        let { fulfillment_set_id, fulfillment_set_type, address, context, ...where } = filters;
        const normalizedConfig = { ...config };
        normalizedConfig.relations = [
            "rules",
            "type",
            "shipping_profile",
            "provider",
            ...(normalizedConfig.relations ?? []),
        ];
        normalizedConfig.take =
            normalizedConfig.take ?? (context ? null : undefined);
        let normalizedFilters = { ...where };
        if (fulfillment_set_id || fulfillment_set_type) {
            const fulfillmentSetConstraints = {};
            if (fulfillment_set_id) {
                fulfillmentSetConstraints["id"] = fulfillment_set_id;
            }
            if (fulfillment_set_type) {
                fulfillmentSetConstraints["type"] = fulfillment_set_type;
            }
            normalizedFilters = {
                ...normalizedFilters,
                service_zone: {
                    ...(normalizedFilters.service_zone ?? {}),
                    fulfillment_set: {
                        ...(normalizedFilters.service_zone?.fulfillment_set ?? {}),
                        ...fulfillmentSetConstraints,
                    },
                },
            };
            normalizedConfig.relations.push("service_zone.fulfillment_set");
        }
        if (address) {
            const geoZoneConstraints = FulfillmentModuleService.buildGeoZoneConstraintsFromAddress(address);
            if (geoZoneConstraints.length) {
                normalizedFilters = {
                    ...normalizedFilters,
                    service_zone: {
                        ...(normalizedFilters.service_zone ?? {}),
                        geo_zones: {
                            $or: geoZoneConstraints.map((geoZoneConstraint) => ({
                                // Apply eventually provided constraints on the geo zone along side the address constraints
                                ...(normalizedFilters.service_zone?.geo_zones ?? {}),
                                ...geoZoneConstraint,
                            })),
                        },
                    },
                };
                normalizedConfig.relations.push("service_zone.geo_zones");
            }
        }
        normalizedConfig.relations = Array.from(new Set(normalizedConfig.relations));
        return {
            filters: normalizedFilters,
            config: normalizedConfig,
            context,
        };
    }
    /**
     * Build the constraints for the geo zones based on the address properties
     * available and the hierarchy of required properties.
     * We build a OR constraint from the narrowest to the broadest
     * e.g. if we have a postal expression we build a constraint for the postal expression require props of type zip
     * and a constraint for the city required props of type city
     * and a constraint for the province code required props of type province
     * and a constraint for the country code required props of type country
     * example:
     * {
     *    $or: [
     *      {
     *        type: "zip",
     *        country_code: "SE",
     *        province_code: "AB",
     *        city: "Stockholm",
     *        postal_expression: "12345"
     *      },
     *      {
     *        type: "city",
     *        country_code: "SE",
     *        province_code: "AB",
     *        city: "Stockholm"
     *      },
     *      {
     *        type: "province",
     *        country_code: "SE",
     *        province_code: "AB"
     *      },
     *      {
     *        type: "country",
     *        country_code: "SE"
     *      }
     *    ]
     *  }
     */
    static buildGeoZoneConstraintsFromAddress(address) {
        /**
         * Define the hierarchy of required properties for the geo zones.
         */
        const geoZoneRequirePropertyHierarchy = {
            postal_expression: [
                "country_code",
                "province_code",
                "city",
                "postal_expression",
            ],
            city: ["country_code", "province_code", "city"],
            province_code: ["country_code", "province_code"],
            country_code: ["country_code"],
        };
        /**
         * The following changes assume that the lowest level check (e.g postal expression) can't exist multiple times in the higher level (e.g country)
         * In case we encounter situations where it is possible to have multiple postal expressions for the same country we need to change the logic back
         * to this pr https://github.com/medusajs/medusa/pull/8066
         */
        const geoZoneConstraints = Object.entries(geoZoneRequirePropertyHierarchy)
            .map(([prop, requiredProps]) => {
            if (address[prop]) {
                return requiredProps.reduce((geoZoneConstraint, prop) => {
                    if ((0, utils_1.isPresent)(address[prop])) {
                        geoZoneConstraint[prop] = address[prop];
                    }
                    return geoZoneConstraint;
                }, {});
            }
            return null;
        })
            .filter((v) => !!v);
        return geoZoneConstraints;
    }
}
exports.default = FulfillmentModuleService;
__decorate([
    (0, utils_1.InjectManager)()
    // @ts-ignore
    ,
    __param(2, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], FulfillmentModuleService.prototype, "listShippingOptions", null);
__decorate([
    (0, utils_1.InjectManager)(),
    __param(2, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], FulfillmentModuleService.prototype, "listShippingOptionsForContext", null);
__decorate([
    (0, utils_1.InjectManager)(),
    __param(2, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], FulfillmentModuleService.prototype, "retrieveFulfillment", null);
__decorate([
    (0, utils_1.InjectManager)(),
    __param(2, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], FulfillmentModuleService.prototype, "listFulfillments", null);
__decorate([
    (0, utils_1.InjectManager)(),
    __param(2, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], FulfillmentModuleService.prototype, "listAndCountFulfillments", null);
__decorate([
    (0, utils_1.InjectManager)(),
    (0, utils_1.EmitEvents)()
    // @ts-expect-error
    ,
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FulfillmentModuleService.prototype, "createFulfillmentSets", null);
__decorate([
    (0, utils_1.InjectTransactionManager)(),
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FulfillmentModuleService.prototype, "createFulfillmentSets_", null);
__decorate([
    (0, utils_1.InjectManager)(),
    (0, utils_1.EmitEvents)()
    // @ts-expect-error
    ,
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FulfillmentModuleService.prototype, "createServiceZones", null);
__decorate([
    (0, utils_1.InjectTransactionManager)(),
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FulfillmentModuleService.prototype, "createServiceZones_", null);
__decorate([
    (0, utils_1.InjectManager)(),
    (0, utils_1.EmitEvents)()
    // @ts-expect-error
    ,
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FulfillmentModuleService.prototype, "createShippingOptions", null);
__decorate([
    (0, utils_1.InjectTransactionManager)(),
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FulfillmentModuleService.prototype, "createShippingOptions_", null);
__decorate([
    (0, utils_1.InjectTransactionManager)(),
    (0, utils_1.EmitEvents)()
    // @ts-expect-error
    ,
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FulfillmentModuleService.prototype, "createShippingProfiles", null);
__decorate([
    (0, utils_1.InjectTransactionManager)(),
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FulfillmentModuleService.prototype, "createShippingProfiles_", null);
__decorate([
    (0, utils_1.InjectManager)(),
    (0, utils_1.EmitEvents)()
    // @ts-expect-error
    ,
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FulfillmentModuleService.prototype, "createGeoZones", null);
__decorate([
    (0, utils_1.InjectManager)(),
    (0, utils_1.EmitEvents)()
    // @ts-expect-error
    ,
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FulfillmentModuleService.prototype, "createShippingOptionRules", null);
__decorate([
    (0, utils_1.InjectTransactionManager)(),
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FulfillmentModuleService.prototype, "createShippingOptionRules_", null);
__decorate([
    (0, utils_1.InjectManager)(),
    (0, utils_1.EmitEvents)(),
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FulfillmentModuleService.prototype, "createFulfillment", null);
__decorate([
    (0, utils_1.InjectManager)(),
    (0, utils_1.EmitEvents)(),
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FulfillmentModuleService.prototype, "deleteFulfillment", null);
__decorate([
    (0, utils_1.InjectManager)(),
    (0, utils_1.EmitEvents)(),
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FulfillmentModuleService.prototype, "createReturnFulfillment", null);
__decorate([
    (0, utils_1.InjectManager)(),
    (0, utils_1.EmitEvents)()
    // @ts-expect-error
    ,
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FulfillmentModuleService.prototype, "updateFulfillmentSets", null);
__decorate([
    (0, utils_1.InjectTransactionManager)(),
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FulfillmentModuleService.prototype, "updateFulfillmentSets_", null);
__decorate([
    (0, utils_1.InjectManager)(),
    (0, utils_1.EmitEvents)()
    // @ts-expect-error
    ,
    __param(2, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], FulfillmentModuleService.prototype, "updateServiceZones", null);
__decorate([
    (0, utils_1.InjectTransactionManager)(),
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FulfillmentModuleService.prototype, "updateServiceZones_", null);
__decorate([
    (0, utils_1.InjectManager)(),
    (0, utils_1.EmitEvents)(),
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FulfillmentModuleService.prototype, "upsertServiceZones", null);
__decorate([
    (0, utils_1.InjectTransactionManager)(),
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FulfillmentModuleService.prototype, "upsertServiceZones_", null);
__decorate([
    (0, utils_1.InjectManager)(),
    (0, utils_1.EmitEvents)()
    // @ts-expect-error
    ,
    __param(2, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], FulfillmentModuleService.prototype, "updateShippingOptions", null);
__decorate([
    (0, utils_1.InjectTransactionManager)(),
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FulfillmentModuleService.prototype, "updateShippingOptions_", null);
__decorate([
    (0, utils_1.InjectManager)(),
    (0, utils_1.EmitEvents)(),
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FulfillmentModuleService.prototype, "upsertShippingOptions", null);
__decorate([
    (0, utils_1.InjectTransactionManager)(),
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FulfillmentModuleService.prototype, "upsertShippingOptions_", null);
__decorate([
    (0, utils_1.InjectTransactionManager)()
    // @ts-expect-error
    ,
    __param(2, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], FulfillmentModuleService.prototype, "updateShippingProfiles", null);
__decorate([
    (0, utils_1.InjectTransactionManager)(),
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FulfillmentModuleService.prototype, "upsertShippingProfiles", null);
__decorate([
    (0, utils_1.InjectManager)(),
    (0, utils_1.EmitEvents)()
    // @ts-expect-error
    ,
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FulfillmentModuleService.prototype, "updateGeoZones", null);
__decorate([
    (0, utils_1.InjectManager)(),
    (0, utils_1.EmitEvents)()
    // @ts-expect-error
    ,
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FulfillmentModuleService.prototype, "updateShippingOptionRules", null);
__decorate([
    (0, utils_1.InjectTransactionManager)(),
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FulfillmentModuleService.prototype, "updateShippingOptionRules_", null);
__decorate([
    (0, utils_1.InjectManager)(),
    (0, utils_1.EmitEvents)(),
    __param(2, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], FulfillmentModuleService.prototype, "updateFulfillment", null);
__decorate([
    (0, utils_1.InjectTransactionManager)(),
    __param(2, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], FulfillmentModuleService.prototype, "updateFulfillment_", null);
__decorate([
    (0, utils_1.InjectManager)(),
    (0, utils_1.EmitEvents)(),
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FulfillmentModuleService.prototype, "cancelFulfillment", null);
__decorate([
    (0, utils_1.InjectManager)(),
    __param(2, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], FulfillmentModuleService.prototype, "validateShippingOption", null);
__decorate([
    (0, utils_1.InjectManager)(),
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", Promise)
], FulfillmentModuleService.prototype, "validateShippingOptionsForPriceCalculation", null);
__decorate([
    (0, utils_1.InjectTransactionManager)()
    // @ts-expect-error
    ,
    __param(1, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FulfillmentModuleService.prototype, "deleteShippingProfiles", null);
__decorate([
    (0, utils_1.InjectTransactionManager)()
    // @ts-expect-error
    ,
    __param(2, (0, utils_1.MedusaContext)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object, Object]),
    __metadata("design:returntype", Promise)
], FulfillmentModuleService.prototype, "softDeleteShippingProfiles", null);
//# sourceMappingURL=fulfillment-module-service.js.map