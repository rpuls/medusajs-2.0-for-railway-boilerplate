import { FulfillmentDTO, FulfillmentWorkflow } from "@medusajs/framework/types";
export declare const createReturnFulfillmentWorkflowId = "create-return-fulfillment-workflow";
/**
 * This workflow creates a fulfillment for a return. It's used by other return-related workflows,
 * such as {@link createAndCompleteReturnOrderWorkflow}.
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you to
 * create a fulfillment for a return within your custom flows.
 *
 * :::note
 *
 * You can retrieve an order's details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const { result } = await createReturnFulfillmentWorkflow(container)
 * .run({
 *   input: {
 *     location_id: "sloc_123",
 *     provider_id: "provider_123",
 *     delivery_address: {
 *       first_name: "John",
 *       last_name: "Doe",
 *       address_1: "Test street 1",
 *       city: "Stockholm",
 *       country_code: "se",
 *       postal_code: "12345",
 *       phone: "123456789"
 *     },
 *     items: [
 *       {
 *         quantity: 1,
 *         sku: "shirt",
 *         title: "Shirt",
 *         barcode: "123"
 *       }
 *     ],
 *     order: {
 *       id: "order_123"
 *       // other order details...
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Create a fulfillment for a return.
 */
export declare const createReturnFulfillmentWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<FulfillmentWorkflow.CreateFulfillmentWorkflowInput, FulfillmentDTO, []>;
//# sourceMappingURL=create-return-fulfillment.d.ts.map