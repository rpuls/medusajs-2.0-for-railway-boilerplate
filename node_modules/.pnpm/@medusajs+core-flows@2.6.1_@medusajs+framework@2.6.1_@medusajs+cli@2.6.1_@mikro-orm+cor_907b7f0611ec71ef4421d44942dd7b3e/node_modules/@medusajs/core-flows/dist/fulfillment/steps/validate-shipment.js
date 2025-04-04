"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateShipmentStep = exports.validateShipmentStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.validateShipmentStepId = "validate-shipment";
/**
 * This step validates that a shipment can be created for a fulfillment.
 * If the shipment has already been created, the fulfillment has been canceled,
 * or the fulfillment does not have a shipping option, the step throws an error.
 */
exports.validateShipmentStep = (0, workflows_sdk_1.createStep)(exports.validateShipmentStepId, async (id, { container }) => {
    const service = container.resolve(utils_1.Modules.FULFILLMENT);
    const fulfillment = await service.retrieveFulfillment(id, {
        select: ["shipped_at", "canceled_at", "shipping_option_id"],
    });
    if (fulfillment.shipped_at) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_ALLOWED, "Shipment has already been created");
    }
    if (fulfillment.canceled_at) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_ALLOWED, "Cannot create shipment for a canceled fulfillment");
    }
    if (!fulfillment.shipping_option_id) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_ALLOWED, "Cannot create shipment without a Shipping Option");
    }
    return new workflows_sdk_1.StepResponse(void 0);
});
//# sourceMappingURL=validate-shipment.js.map