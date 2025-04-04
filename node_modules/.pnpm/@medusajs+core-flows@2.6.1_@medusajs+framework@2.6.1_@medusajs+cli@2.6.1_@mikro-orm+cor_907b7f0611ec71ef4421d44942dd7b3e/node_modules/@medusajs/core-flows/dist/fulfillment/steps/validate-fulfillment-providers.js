"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFulfillmentProvidersStep = exports.validateFulfillmentProvidersStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.validateFulfillmentProvidersStepId = "validate-fulfillment-providers-step";
/**
 * This step validates that the specified fulfillment providers are available in the
 * specified service zones. If the service zone or provider ID are not specified, or
 * the provider is not available in the service zone, the step throws an error.
 */
exports.validateFulfillmentProvidersStep = (0, workflows_sdk_1.createStep)(exports.validateFulfillmentProvidersStepId, async (input, { container }) => {
    const dataToValidate = [];
    const fulfillmentService = container.resolve(utils_1.Modules.FULFILLMENT);
    const shippingOptions = await fulfillmentService.listShippingOptions({
        id: input.map((d) => d.id).filter(Boolean),
    }, {
        select: ["id", "service_zone_id", "provider_id"],
    });
    const shippingOptionsMap = new Map(shippingOptions.map((so) => [so.id, so]));
    const remoteQuery = container.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    for (const data of input) {
        if ("id" in data) {
            const existingShippingOption = shippingOptionsMap.get(data.id);
            if (!data.service_zone_id) {
                data.service_zone_id = existingShippingOption?.service_zone_id;
            }
            if (!data.provider_id) {
                data.provider_id = existingShippingOption?.provider_id;
            }
            dataToValidate.push({
                service_zone_id: data.service_zone_id,
                provider_id: data.provider_id,
            });
            continue;
        }
        if (data.service_zone_id && data.provider_id) {
            dataToValidate.push({
                service_zone_id: data.service_zone_id,
                provider_id: data.provider_id,
            });
            continue;
        }
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_ALLOWED, `service_zone_id and provider_id are required to create a shipping option`);
    }
    const serviceZones = await remoteQuery({
        entryPoint: "service_zone",
        fields: ["id", "fulfillment_set.locations.fulfillment_providers.id"],
        variables: {
            id: input.map((d) => d.service_zone_id),
        },
    });
    const serviceZonesMap = new Map(serviceZones.map((sz) => [sz.id, sz]));
    const invalidProviders = [];
    for (const data of dataToValidate) {
        const serviceZone = serviceZonesMap.get(data.service_zone_id);
        const stockLocations = serviceZone?.fulfillment_set?.locations ?? [];
        const fulfillmentProviders = [];
        for (const stockLocation of stockLocations) {
            const providersForStockLocation = (stockLocation.fulfillment_providers ?? [])
                .filter(Boolean)
                .map((fp) => fp.id);
            fulfillmentProviders.push(...providersForStockLocation);
        }
        if (!fulfillmentProviders.includes(data.provider_id)) {
            invalidProviders.push(data.provider_id);
        }
    }
    if (invalidProviders.length) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_ALLOWED, `Providers (${invalidProviders.join(",")}) are not enabled for the service location`);
    }
    return new workflows_sdk_1.StepResponse(void 0);
});
//# sourceMappingURL=validate-fulfillment-providers.js.map