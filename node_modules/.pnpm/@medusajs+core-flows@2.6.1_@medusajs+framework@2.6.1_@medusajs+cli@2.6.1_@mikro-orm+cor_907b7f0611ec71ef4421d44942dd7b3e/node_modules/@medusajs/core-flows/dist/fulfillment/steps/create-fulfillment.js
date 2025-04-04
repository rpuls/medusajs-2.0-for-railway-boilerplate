"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFulfillmentStep = exports.createFulfillmentStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.createFulfillmentStepId = "create-fulfillment";
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
exports.createFulfillmentStep = (0, workflows_sdk_1.createStep)(exports.createFulfillmentStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.FULFILLMENT);
    const fulfillment = await service.createFulfillment(data);
    return new workflows_sdk_1.StepResponse(fulfillment, fulfillment.id);
}, async (id, { container }) => {
    if (!id) {
        return;
    }
    const service = container.resolve(utils_1.Modules.FULFILLMENT);
    await service.cancelFulfillment(id);
});
//# sourceMappingURL=create-fulfillment.js.map