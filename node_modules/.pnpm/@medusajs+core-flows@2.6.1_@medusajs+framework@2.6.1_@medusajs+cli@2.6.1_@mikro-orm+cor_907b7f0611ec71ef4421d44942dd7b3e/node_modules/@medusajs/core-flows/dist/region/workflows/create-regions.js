"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRegionsWorkflow = exports.createRegionsWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const emit_event_1 = require("../../common/steps/emit-event");
const pricing_1 = require("../../pricing");
const steps_1 = require("../steps");
const set_regions_payment_providers_1 = require("../steps/set-regions-payment-providers");
exports.createRegionsWorkflowId = "create-regions";
/**
 * This workflow creates one or more regions. It's used by the
 * [Create Region Admin API Route](https://docs.medusajs.com/api/admin#regions_postregions).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to create regions in your custom flows.
 *
 * @example
 * const { result } = await createRegionsWorkflow(container)
 * .run({
 *   input: {
 *     regions: [
 *       {
 *         currency_code: "usd",
 *         name: "United States",
 *         countries: ["us"],
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Create one or more regions.
 */
exports.createRegionsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.createRegionsWorkflowId, (input) => {
    const data = (0, workflows_sdk_1.transform)(input, (data) => {
        const regionIndexToAdditionalData = data.regions.map((region, index) => {
            return {
                region_index: index,
                payment_providers: region.payment_providers,
                is_tax_inclusive: region.is_tax_inclusive,
            };
        });
        return {
            regions: data.regions.map((r) => {
                const resp = { ...r };
                delete resp.is_tax_inclusive;
                delete resp.payment_providers;
                return resp;
            }),
            regionIndexToAdditionalData,
        };
    });
    const regions = (0, steps_1.createRegionsStep)(data.regions);
    const normalizedRegionProviderData = (0, workflows_sdk_1.transform)({
        regionIndexToAdditionalData: data.regionIndexToAdditionalData,
        regions,
    }, (data) => {
        return data.regionIndexToAdditionalData.map(({ region_index, payment_providers }) => {
            return {
                id: data.regions[region_index].id,
                payment_providers,
            };
        });
    });
    const normalizedRegionPricePreferencesData = (0, workflows_sdk_1.transform)({
        regionIndexToAdditionalData: data.regionIndexToAdditionalData,
        regions,
    }, (data) => {
        return data.regionIndexToAdditionalData.map(({ region_index, is_tax_inclusive }) => {
            return {
                attribute: "region_id",
                value: data.regions[region_index].id,
                is_tax_inclusive,
            };
        });
    });
    const regionsIdEvents = (0, workflows_sdk_1.transform)({ regions }, ({ regions }) => {
        return regions.map((v) => {
            return { id: v.id };
        });
    });
    (0, workflows_sdk_1.parallelize)((0, set_regions_payment_providers_1.setRegionsPaymentProvidersStep)({
        input: normalizedRegionProviderData,
    }), pricing_1.createPricePreferencesWorkflow.runAsStep({
        input: normalizedRegionPricePreferencesData,
    }), (0, emit_event_1.emitEventStep)({
        eventName: utils_1.RegionWorkflowEvents.CREATED,
        data: regionsIdEvents,
    }));
    return new workflows_sdk_1.WorkflowResponse(regions);
});
//# sourceMappingURL=create-regions.js.map