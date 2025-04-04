import { FulfillmentWorkflow } from "@medusajs/framework/types";
export declare const deleteShippingOptionsWorkflowId = "delete-shipping-options-workflow";
/**
 * This workflow deletes one or more shipping options. It's used by the
 * [Delete Shipping Options Admin API Route](https://docs.medusajs.com/api/admin#shipping-options_deleteshippingoptionsid).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you to
 * delete shipping options within your custom flows.
 *
 * @example
 * const { result } = await deleteShippingOptionsWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["so_123"]
 *   }
 * })
 *
 * @summary
 *
 * Delete one or more shipping options.
 */
export declare const deleteShippingOptionsWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<FulfillmentWorkflow.DeleteShippingOptionsWorkflowInput, unknown, any[]>;
//# sourceMappingURL=delete-shipping-options.d.ts.map