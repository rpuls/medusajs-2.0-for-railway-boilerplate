import { FulfillmentTypes } from "@medusajs/framework/types";
export declare const createReturnFulfillmentStepId = "create-return-fulfillment";
/**
 * This step creates a fulfillment for a return.
 *
 * @example
 * const data = createReturnFulfillmentStep({
 *   location_id: "sloc_123",
 *   provider_id: "provider_123",
 *   delivery_address: {
 *     first_name: "John",
 *     last_name: "Doe",
 *     address_1: "Test Street 1",
 *     city: "Test City",
 *     postal_code: "12345",
 *     country_code: "US",
 *     phone: "123456789",
 *   },
 *   items: [
 *     {
 *       title: "Shirt",
 *       sku: "shirt",
 *       quantity: 1,
 *       barcode: "123456789",
 *     }
 *   ]
 * })
 */
export declare const createReturnFulfillmentStep: import("@medusajs/framework/workflows-sdk").StepFunction<FulfillmentTypes.CreateFulfillmentDTO, FulfillmentTypes.FulfillmentDTO>;
//# sourceMappingURL=create-return-fulfillment.d.ts.map