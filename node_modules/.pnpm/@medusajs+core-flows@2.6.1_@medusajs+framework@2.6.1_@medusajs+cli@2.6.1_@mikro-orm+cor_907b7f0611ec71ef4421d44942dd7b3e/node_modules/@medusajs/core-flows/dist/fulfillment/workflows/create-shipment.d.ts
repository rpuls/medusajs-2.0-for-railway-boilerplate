import { FulfillmentWorkflow } from "@medusajs/framework/types";
export declare const createShipmentWorkflowId = "create-shipment-workflow";
/**
 * This workflow creates shipments for a fulfillment. It's used by the
 * [Create Shipment Admin API Route](https://docs.medusajs.com/api/admin#fulfillments_postfulfillmentsidshipment).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you to
 * create shipments within your custom flows.
 *
 * @example
 * const { result } = await createShipmentWorkflow(container)
 * .run({
 *   input: {
 *     id: "ful_123",
 *     labels: [
 *       {
 *         tracking_url: "https://example.com",
 *         tracking_number: "123",
 *         label_url: "https://example.com"
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Create a shipment for a fulfillment.
 */
export declare const createShipmentWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<FulfillmentWorkflow.CreateShipmentWorkflowInput, import("@medusajs/framework/types").FulfillmentDTO, []>;
//# sourceMappingURL=create-shipment.d.ts.map