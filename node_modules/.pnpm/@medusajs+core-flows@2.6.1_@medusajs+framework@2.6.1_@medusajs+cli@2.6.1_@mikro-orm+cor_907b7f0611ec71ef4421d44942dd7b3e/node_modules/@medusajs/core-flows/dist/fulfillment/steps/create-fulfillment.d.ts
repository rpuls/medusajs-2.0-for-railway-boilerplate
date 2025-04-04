import { FulfillmentTypes } from "@medusajs/framework/types";
export declare const createFulfillmentStepId = "create-fulfillment";
/**
 * This step creates a fulfillment.
 *
 * @example
 * const data = createFulfillmentStep({
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
export declare const createFulfillmentStep: import("@medusajs/framework/workflows-sdk").StepFunction<FulfillmentTypes.CreateFulfillmentDTO, FulfillmentTypes.FulfillmentDTO>;
//# sourceMappingURL=create-fulfillment.d.ts.map