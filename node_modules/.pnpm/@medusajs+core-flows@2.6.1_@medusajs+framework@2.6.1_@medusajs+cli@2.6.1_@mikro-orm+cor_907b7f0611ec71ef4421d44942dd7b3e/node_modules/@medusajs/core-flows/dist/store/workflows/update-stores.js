"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStoresWorkflow = exports.updateStoresWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
const pricing_1 = require("../../pricing");
exports.updateStoresWorkflowId = "update-stores";
/**
 * This workflow updates stores matching the specified filters. It's used by the
 * [Update Store Admin API Route](https://docs.medusajs.com/api/admin#stores_poststoresid).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * update stores within your custom flows.
 *
 * @example
 * const { result } = await updateStoresWorkflow(container)
 * .run({
 *   input: {
 *     selector: {
 *       id: "store_123"
 *     },
 *     update: {
 *       name: "Acme"
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Update stores.
 */
exports.updateStoresWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.updateStoresWorkflowId, (input) => {
    const normalizedInput = (0, workflows_sdk_1.transform)({ input }, (data) => {
        if (!data.input.update.supported_currencies?.length) {
            return data.input;
        }
        return {
            selector: data.input.selector,
            update: {
                ...data.input.update,
                supported_currencies: data.input.update.supported_currencies.map((currency) => {
                    return {
                        currency_code: currency.currency_code,
                        is_default: currency.is_default,
                    };
                }),
            },
        };
    });
    const stores = (0, steps_1.updateStoresStep)(normalizedInput);
    (0, workflows_sdk_1.when)({ input }, (data) => {
        return !!data.input.update.supported_currencies?.length;
    }).then(() => {
        const upsertPricePreferences = (0, workflows_sdk_1.transform)({ input }, (data) => {
            return data.input.update.supported_currencies.map((currency) => {
                return {
                    attribute: "currency_code",
                    value: currency.currency_code,
                    is_tax_inclusive: currency.is_tax_inclusive,
                };
            });
        });
        (0, pricing_1.updatePricePreferencesAsArrayStep)(upsertPricePreferences);
    });
    return new workflows_sdk_1.WorkflowResponse(stores);
});
//# sourceMappingURL=update-stores.js.map