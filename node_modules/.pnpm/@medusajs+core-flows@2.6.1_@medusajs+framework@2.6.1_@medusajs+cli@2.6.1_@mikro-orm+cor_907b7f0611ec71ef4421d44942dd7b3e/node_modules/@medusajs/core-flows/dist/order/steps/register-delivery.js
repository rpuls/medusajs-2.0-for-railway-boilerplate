"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerOrderDeliveryStep = exports.registerOrderDeliveryStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.registerOrderDeliveryStepId = "register-order-delivery";
/**
 * This step registers a delivery for an order fulfillment.
 */
exports.registerOrderDeliveryStep = (0, workflows_sdk_1.createStep)(exports.registerOrderDeliveryStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.ModuleRegistrationName.ORDER);
    await service.registerDelivery(data);
    return new workflows_sdk_1.StepResponse(void 0, data.order_id);
}, async (orderId, { container }) => {
    if (!orderId) {
        return;
    }
    const service = container.resolve(utils_1.ModuleRegistrationName.ORDER);
    await service.revertLastVersion(orderId);
});
//# sourceMappingURL=register-delivery.js.map