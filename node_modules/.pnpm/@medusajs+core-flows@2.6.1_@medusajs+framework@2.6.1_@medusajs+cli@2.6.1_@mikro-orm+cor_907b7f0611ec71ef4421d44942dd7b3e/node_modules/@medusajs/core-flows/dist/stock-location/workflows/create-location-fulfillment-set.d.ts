import { CreateLocationFulfillmentSetWorkflowInputDTO } from "@medusajs/framework/types";
export declare const createLocationFulfillmentSetWorkflowId = "create-location-fulfillment-set";
/**
 * This workflow adds a fulfillment set to a stock location. It's used by the
 * [Add Fulfillment Set to Stock Location Admin API Route](https://docs.medusajs.com/api/admin#stock-locations_poststocklocationsidfulfillmentsets).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you
 * to add fulfillment sets to a stock location in your custom flows.
 *
 * @example
 * const { result } = await createLocationFulfillmentSetWorkflow(container)
 * .run({
 *   input: {
 *     location_id: "sloc_123",
 *     fulfillment_set_data: {
 *       name: "Shipping",
 *       type: "shipping",
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Add fulfillment set to a stock location.
 */
export declare const createLocationFulfillmentSetWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<CreateLocationFulfillmentSetWorkflowInputDTO, unknown, any[]>;
//# sourceMappingURL=create-location-fulfillment-set.d.ts.map