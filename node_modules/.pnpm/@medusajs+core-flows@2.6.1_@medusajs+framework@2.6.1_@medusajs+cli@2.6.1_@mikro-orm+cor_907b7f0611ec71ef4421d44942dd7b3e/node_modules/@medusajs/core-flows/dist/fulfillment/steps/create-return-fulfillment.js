"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReturnFulfillmentStep = exports.createReturnFulfillmentStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.createReturnFulfillmentStepId = "create-return-fulfillment";
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
exports.createReturnFulfillmentStep = (0, workflows_sdk_1.createStep)(exports.createReturnFulfillmentStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.FULFILLMENT);
    const fulfillment = await service.createReturnFulfillment(data);
    return new workflows_sdk_1.StepResponse(fulfillment, fulfillment.id);
}, async (id, { container }) => {
    if (!id) {
        return;
    }
    const service = container.resolve(utils_1.Modules.FULFILLMENT);
    // await service.cancelReturnFulfillment(id) // TODO: Implement cancelReturnFulfillment
    await service.cancelFulfillment(id);
});
//# sourceMappingURL=create-return-fulfillment.js.map