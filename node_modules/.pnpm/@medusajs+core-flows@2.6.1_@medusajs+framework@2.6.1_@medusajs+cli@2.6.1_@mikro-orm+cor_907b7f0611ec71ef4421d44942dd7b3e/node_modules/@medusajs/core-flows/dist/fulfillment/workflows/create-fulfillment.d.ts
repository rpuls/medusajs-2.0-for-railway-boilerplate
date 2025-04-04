import { FulfillmentDTO, FulfillmentWorkflow } from "@medusajs/framework/types";
export declare const createFulfillmentWorkflowId = "create-fulfillment-workflow";
/**
 * This workflow creates a fulfillment, which can be used for an order, return, exchanges, and similar concepts.
 * The workflow is used by the [Create Fulfillment Admin API Route](https://docs.medusajs.com/api/admin#fulfillments_postfulfillments).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you to
 * create a fulfillment within your custom flows.
 *
 * :::note
 *
 * You can retrieve an order's details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const { result } = await createFulfillmentWorkflow(container)
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
 * Create a fulfillment.
 */
export declare const createFulfillmentWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<FulfillmentWorkflow.CreateFulfillmentWorkflowInput, FulfillmentDTO, []>;
//# sourceMappingURL=create-fulfillment.d.ts.map