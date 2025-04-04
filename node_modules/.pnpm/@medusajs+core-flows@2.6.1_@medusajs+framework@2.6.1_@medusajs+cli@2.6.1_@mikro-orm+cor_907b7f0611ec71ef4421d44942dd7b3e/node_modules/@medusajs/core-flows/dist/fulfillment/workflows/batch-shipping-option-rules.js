"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchShippingOptionRulesWorkflow = exports.batchShippingOptionRulesWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
const update_shipping_option_rules_1 = require("../steps/update-shipping-option-rules");
exports.batchShippingOptionRulesWorkflowId = "batch-shipping-option-rules";
/**
 * This workflow manages shipping option rules allowing you to create, update, or delete them. It's used by the
 * [Manage the Rules of Shipping Option Admin API Route](https://docs.medusajs.com/api/admin#shipping-options_postshippingoptionsidrulesbatch).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you to
 * manage shipping option rules within your custom flows.
 *
 * @example
 * const { result } = await batchShippingOptionRulesWorkflow(container)
 * .run({
 *   input: {
 *     create: [
 *       {
 *         attribute: "customer_group",
 *         value: "cusgrp_123",
 *         operator: "eq",
 *         shipping_option_id: "so_123"
 *       }
 *     ],
 *     update: [
 *       {
 *         id: "sor_123",
 *         operator: "in"
 *       }
 *     ],
 *     delete: ["sor_321"]
 *   }
 * })
 *
 * @summary
 *
 * Manage shipping option rules.
 */
exports.batchShippingOptionRulesWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.batchShippingOptionRulesWorkflowId, (input) => {
    const actionInputs = (0, workflows_sdk_1.transform)({ input }, (data) => {
        const { create, update, delete: del } = data.input;
        return {
            createInput: { data: create ?? [] },
            updateInput: { data: update ?? [] },
            deleteInput: { ids: del ?? [] },
        };
    });
    const [created, updated, deleted] = (0, workflows_sdk_1.parallelize)((0, steps_1.createShippingOptionRulesStep)(actionInputs.createInput), (0, update_shipping_option_rules_1.updateShippingOptionRulesStep)(actionInputs.updateInput), (0, steps_1.deleteShippingOptionRulesStep)(actionInputs.deleteInput));
    return new workflows_sdk_1.WorkflowResponse((0, workflows_sdk_1.transform)({ created, deleted, updated }, (data) => data));
});
//# sourceMappingURL=batch-shipping-option-rules.js.map