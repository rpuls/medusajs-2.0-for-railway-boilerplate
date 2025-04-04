import { BatchWorkflowInput, BatchWorkflowOutput, CreateShippingOptionRuleDTO, ShippingOptionRuleDTO, UpdateShippingOptionRuleDTO } from "@medusajs/framework/types";
/**
 * The data to manage the shipping option rules in bulk.
 *
 * @property create - The shipping option rules to create.
 * @property update - The shipping option rules to update.
 * @property delete - The IDs of the shipping option rules to delete.
 */
export interface BatchShippingOptionRulesInput extends BatchWorkflowInput<CreateShippingOptionRuleDTO, UpdateShippingOptionRuleDTO> {
}
/**
 * The result of managing the shipping option rules in bulk.
 *
 * @property created - The shipping option rules that were created.
 * @property updated - The shipping option rules that were updated.
 * @property deleted - The IDs of the shipping option rules that were deleted.
 */
export interface BatchShippingOptionRulesOutput extends BatchWorkflowOutput<ShippingOptionRuleDTO> {
}
export declare const batchShippingOptionRulesWorkflowId = "batch-shipping-option-rules";
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
export declare const batchShippingOptionRulesWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<BatchShippingOptionRulesInput, BatchShippingOptionRulesOutput, []>;
//# sourceMappingURL=batch-shipping-option-rules.d.ts.map