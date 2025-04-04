import { WorkflowTypes } from "@medusajs/framework/types";
export declare const exportProductsWorkflowId = "export-products";
/**
 * This workflow exports products matching the specified filters. It's used by the
 * [Export Products Admin API Route](https://docs.medusajs.com/api/admin#products_postproductsexport).
 *
 * :::note
 *
 * This workflow doesn't return the exported products. Instead, it sends a notification to the admin
 * users that they can download the exported products. Learn more in the [API Reference](https://docs.medusajs.com/api/admin#products_postproductsexport).
 *
 * :::
 *
 * @example
 * To export all products:
 *
 * ```ts
 * const { result } = await exportProductsWorkflow(container)
 * .run({
 *   input: {
 *     select: ["*"],
 *   }
 * })
 * ```
 *
 * To export products matching a criteria:
 *
 * ```ts
 * const { result } = await exportProductsWorkflow(container)
 * .run({
 *   input: {
 *     select: ["*"],
 *     filter: {
 *       collection_id: "pcol_123"
 *     }
 *   }
 * })
 * ```
 *
 * @summary
 *
 * Export products with filtering capabilities.
 */
export declare const exportProductsWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<WorkflowTypes.ProductWorkflow.ExportProductsDTO, unknown, any[]>;
//# sourceMappingURL=export-products.d.ts.map