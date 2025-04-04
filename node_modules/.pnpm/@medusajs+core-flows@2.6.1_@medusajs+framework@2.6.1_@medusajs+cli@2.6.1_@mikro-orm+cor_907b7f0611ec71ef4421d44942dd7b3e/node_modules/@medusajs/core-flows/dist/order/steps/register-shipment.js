"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerOrderShipmentStep = exports.registerOrderShipmentStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.registerOrderShipmentStepId = "register-order-shipment";
/**
 * This step registers a shipment for an order.
 */
exports.registerOrderShipmentStep = (0, workflows_sdk_1.createStep)(exports.registerOrderShipmentStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.ORDER);
    await service.registerShipment(data);
    return new workflows_sdk_1.StepResponse(void 0, data.order_id);
}, async (orderId, { container }) => {
    if (!orderId) {
        return;
    }
    const service = container.resolve(utils_1.Modules.ORDER);
    await service.revertLastVersion(orderId);
});
//# sourceMappingURL=register-shipment.js.map