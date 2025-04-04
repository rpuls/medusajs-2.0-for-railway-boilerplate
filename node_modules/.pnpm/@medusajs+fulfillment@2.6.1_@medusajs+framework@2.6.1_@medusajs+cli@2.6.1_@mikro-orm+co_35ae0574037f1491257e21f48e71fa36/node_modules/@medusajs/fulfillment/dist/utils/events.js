"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventBuilders = void 0;
exports.buildCreatedFulfillmentEvents = buildCreatedFulfillmentEvents;
exports.buildCreatedShippingOptionEvents = buildCreatedShippingOptionEvents;
exports.buildCreatedFulfillmentSetEvents = buildCreatedFulfillmentSetEvents;
exports.buildCreatedServiceZoneEvents = buildCreatedServiceZoneEvents;
const utils_1 = require("@medusajs/framework/utils");
exports.eventBuilders = {
    createdFulfillment: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.FULFILLMENT,
        action: utils_1.CommonEvents.CREATED,
        object: "fulfillment",
        eventName: utils_1.FulfillmentEvents.FULFILLMENT_CREATED,
    }),
    updatedFulfillment: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.FULFILLMENT,
        action: utils_1.CommonEvents.UPDATED,
        object: "fulfillment",
        eventName: utils_1.FulfillmentEvents.FULFILLMENT_UPDATED,
    }),
    createdFulfillmentAddress: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.FULFILLMENT,
        action: utils_1.CommonEvents.CREATED,
        object: "fulfillment_address",
        eventName: utils_1.FulfillmentEvents.FULFILLMENT_ADDRESS_CREATED,
    }),
    createdFulfillmentItem: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.FULFILLMENT,
        action: utils_1.CommonEvents.CREATED,
        object: "fulfillment_item",
        eventName: utils_1.FulfillmentEvents.FULFILLMENT_ITEM_CREATED,
    }),
    createdFulfillmentLabel: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.FULFILLMENT,
        action: utils_1.CommonEvents.CREATED,
        object: "fulfillment_label",
        eventName: utils_1.FulfillmentEvents.FULFILLMENT_LABEL_CREATED,
    }),
    updatedFulfillmentLabel: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.FULFILLMENT,
        action: utils_1.CommonEvents.UPDATED,
        object: "fulfillment_label",
        eventName: utils_1.FulfillmentEvents.FULFILLMENT_LABEL_UPDATED,
    }),
    deletedFulfillmentLabel: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.FULFILLMENT,
        action: utils_1.CommonEvents.DELETED,
        object: "fulfillment_label",
        eventName: utils_1.FulfillmentEvents.FULFILLMENT_LABEL_DELETED,
    }),
    createdShippingProfile: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.FULFILLMENT,
        action: utils_1.CommonEvents.CREATED,
        object: "shipping_profile",
        eventName: utils_1.FulfillmentEvents.SHIPPING_PROFILE_CREATED,
    }),
    createdShippingOptionType: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.FULFILLMENT,
        action: utils_1.CommonEvents.CREATED,
        object: "shipping_option_type",
        eventName: utils_1.FulfillmentEvents.SHIPPING_OPTION_TYPE_CREATED,
    }),
    updatedShippingOptionType: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.FULFILLMENT,
        action: utils_1.CommonEvents.UPDATED,
        object: "shipping_option_type",
        eventName: utils_1.FulfillmentEvents.SHIPPING_OPTION_TYPE_UPDATED,
    }),
    deletedShippingOptionType: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.FULFILLMENT,
        action: utils_1.CommonEvents.DELETED,
        object: "shipping_option_type",
        eventName: utils_1.FulfillmentEvents.SHIPPING_OPTION_TYPE_DELETED,
    }),
    createdShippingOptionRule: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.FULFILLMENT,
        action: utils_1.CommonEvents.CREATED,
        object: "shipping_option_rule",
        eventName: utils_1.FulfillmentEvents.SHIPPING_OPTION_RULE_CREATED,
    }),
    updatedShippingOptionRule: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.FULFILLMENT,
        action: utils_1.CommonEvents.UPDATED,
        object: "shipping_option_rule",
        eventName: utils_1.FulfillmentEvents.SHIPPING_OPTION_RULE_UPDATED,
    }),
    deletedShippingOptionRule: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.FULFILLMENT,
        action: utils_1.CommonEvents.DELETED,
        object: "shipping_option_rule",
        eventName: utils_1.FulfillmentEvents.SHIPPING_OPTION_RULE_DELETED,
    }),
    createdShippingOption: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.FULFILLMENT,
        action: utils_1.CommonEvents.CREATED,
        object: "shipping_option",
        eventName: utils_1.FulfillmentEvents.SHIPPING_OPTION_CREATED,
    }),
    updatedShippingOption: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.FULFILLMENT,
        action: utils_1.CommonEvents.UPDATED,
        object: "shipping_option",
        eventName: utils_1.FulfillmentEvents.SHIPPING_OPTION_UPDATED,
    }),
    createdFulfillmentSet: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.FULFILLMENT,
        action: utils_1.CommonEvents.CREATED,
        object: "fulfillment_set",
        eventName: utils_1.FulfillmentEvents.FULFILLMENT_SET_CREATED,
    }),
    updatedFulfillmentSet: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.FULFILLMENT,
        action: utils_1.CommonEvents.UPDATED,
        object: "fulfillment_set",
        eventName: utils_1.FulfillmentEvents.FULFILLMENT_SET_UPDATED,
    }),
    deletedFulfillmentSet: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.FULFILLMENT,
        action: utils_1.CommonEvents.DELETED,
        object: "fulfillment_set",
        eventName: utils_1.FulfillmentEvents.FULFILLMENT_SET_DELETED,
    }),
    createdServiceZone: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.FULFILLMENT,
        action: utils_1.CommonEvents.CREATED,
        object: "service_zone",
        eventName: utils_1.FulfillmentEvents.SERVICE_ZONE_CREATED,
    }),
    updatedServiceZone: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.FULFILLMENT,
        action: utils_1.CommonEvents.UPDATED,
        object: "service_zone",
        eventName: utils_1.FulfillmentEvents.SERVICE_ZONE_UPDATED,
    }),
    deletedServiceZone: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.FULFILLMENT,
        action: utils_1.CommonEvents.DELETED,
        object: "service_zone",
        eventName: utils_1.FulfillmentEvents.SERVICE_ZONE_DELETED,
    }),
    createdGeoZone: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.FULFILLMENT,
        action: utils_1.CommonEvents.CREATED,
        object: "geo_zone",
        eventName: utils_1.FulfillmentEvents.GEO_ZONE_CREATED,
    }),
    updatedGeoZone: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.FULFILLMENT,
        action: utils_1.CommonEvents.UPDATED,
        object: "geo_zone",
        eventName: utils_1.FulfillmentEvents.GEO_ZONE_UPDATED,
    }),
    deletedGeoZone: (0, utils_1.moduleEventBuilderFactory)({
        source: utils_1.Modules.FULFILLMENT,
        action: utils_1.CommonEvents.DELETED,
        object: "geo_zone",
        eventName: utils_1.FulfillmentEvents.GEO_ZONE_DELETED,
    }),
};
function buildCreatedFulfillmentEvents({ fulfillments, sharedContext, }) {
    if (!fulfillments.length) {
        return;
    }
    const fulfillments_ = [];
    const addresses = [];
    const items = [];
    const labels = [];
    fulfillments.forEach((fulfillment) => {
        fulfillments_.push({ id: fulfillment.id });
        if (fulfillment.delivery_address) {
            addresses.push({ id: fulfillment.delivery_address.id });
        }
        if (fulfillment.items) {
            items.push(...fulfillment.items);
        }
        if (fulfillment.labels) {
            labels.push(...fulfillment.labels);
        }
    });
    exports.eventBuilders.createdFulfillment({ data: fulfillments_, sharedContext });
    exports.eventBuilders.createdFulfillmentAddress({ data: addresses, sharedContext });
    exports.eventBuilders.createdFulfillmentItem({ data: items, sharedContext });
    exports.eventBuilders.createdFulfillmentLabel({ data: labels, sharedContext });
}
function buildCreatedShippingOptionEvents({ shippingOptions, sharedContext, }) {
    if (!shippingOptions.length) {
        return;
    }
    const options = [];
    const types = [];
    const rules = [];
    shippingOptions.forEach((shippingOption) => {
        options.push({ id: shippingOption.id });
        if (shippingOption.type) {
            types.push(shippingOption.type);
        }
        if (shippingOption.rules) {
            rules.push(...shippingOption.rules);
        }
    });
    exports.eventBuilders.createdShippingOption({ data: options, sharedContext });
    exports.eventBuilders.createdShippingOptionType({ data: types, sharedContext });
    exports.eventBuilders.createdShippingOptionRule({ data: rules, sharedContext });
}
function buildCreatedFulfillmentSetEvents({ fulfillmentSets, sharedContext, }) {
    if (!fulfillmentSets.length) {
        return;
    }
    const serviceZones = [];
    fulfillmentSets.forEach((fulfillmentSet) => {
        if (!fulfillmentSet.service_zones?.length) {
            return;
        }
        serviceZones.push(...fulfillmentSet.service_zones);
    });
    exports.eventBuilders.createdFulfillmentSet({ data: fulfillmentSets, sharedContext });
    buildCreatedServiceZoneEvents({ serviceZones, sharedContext });
}
function buildCreatedServiceZoneEvents({ serviceZones, sharedContext, }) {
    if (!serviceZones.length) {
        return;
    }
    const geoZones = [];
    serviceZones.forEach((serviceZone) => {
        if (!serviceZone.geo_zones.length) {
            return;
        }
        geoZones.push(...serviceZone.geo_zones);
    });
    exports.eventBuilders.createdServiceZone({ data: serviceZones, sharedContext });
    exports.eventBuilders.createdGeoZone({ data: geoZones, sharedContext });
}
//# sourceMappingURL=events.js.map