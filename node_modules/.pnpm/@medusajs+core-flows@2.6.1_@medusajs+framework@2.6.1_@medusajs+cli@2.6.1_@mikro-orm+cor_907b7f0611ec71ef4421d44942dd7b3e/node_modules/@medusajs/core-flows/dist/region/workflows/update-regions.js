"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRegionsWorkflow = exports.updateRegionsWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const emit_event_1 = require("../../common/steps/emit-event");
const pricing_1 = require("../../pricing");
const steps_1 = require("../steps");
const set_regions_payment_providers_1 = require("../steps/set-regions-payment-providers");
exports.updateRegionsWorkflowId = "update-regions";
/**
 * This workflow updates regions matching the specified filters. It's used by the
 * [Update Region Admin API Route](https://docs.medusajs.com/api/admin#regions_postregionsid).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to update regions in your custom flows.
 *
 * @example
 * const { result } = await updateRegionsWorkflow(container)
 * .run({
 *   input: {
 *     selector: {
 *       id: "reg_123"
 *     },
 *     update: {
 *       name: "United States"
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Update regions.
 */
exports.updateRegionsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.updateRegionsWorkflowId, (input) => {
    const normalizedInput = (0, workflows_sdk_1.transform)(input, (data) => {
        const { selector, update } = data;
        const { payment_providers = [], is_tax_inclusive, ...rest } = update;
        return {
            selector,
            update: rest,
            payment_providers,
            is_tax_inclusive,
        };
    });
    const regions = (0, steps_1.updateRegionsStep)(normalizedInput);
    const upsertProvidersNormalizedInput = (0, workflows_sdk_1.transform)({ normalizedInput, regions }, (data) => {
        return data.regions.map((region) => {
            return {
                id: region.id,
                payment_providers: data.normalizedInput.payment_providers,
            };
        });
    });
    (0, workflows_sdk_1.when)({ normalizedInput }, (data) => {
        return data.normalizedInput.is_tax_inclusive !== undefined;
    }).then(() => {
        const updatePricePreferencesInput = (0, workflows_sdk_1.transform)({ normalizedInput, regions }, (data) => {
            return {
                selector: {
                    $or: data.regions.map((region) => {
                        return {
                            attribute: "region_id",
                            value: region.id,
                        };
                    }),
                },
                update: {
                    is_tax_inclusive: data.normalizedInput.is_tax_inclusive,
                },
            };
        });
        pricing_1.updatePricePreferencesWorkflow.runAsStep({
            input: updatePricePreferencesInput,
        });
    });
    const regionIdEvents = (0, workflows_sdk_1.transform)({ regions }, ({ regions }) => {
        return regions?.map((region) => {
            return { id: region.id };
        });
    });
    (0, workflows_sdk_1.parallelize)((0, set_regions_payment_providers_1.setRegionsPaymentProvidersStep)({
        input: upsertProvidersNormalizedInput,
    }), (0, emit_event_1.emitEventStep)({
        eventName: utils_1.RegionWorkflowEvents.UPDATED,
        data: regionIdEvents,
    }));
    return new workflows_sdk_1.WorkflowResponse(regions);
});
//# sourceMappingURL=update-regions.js.map