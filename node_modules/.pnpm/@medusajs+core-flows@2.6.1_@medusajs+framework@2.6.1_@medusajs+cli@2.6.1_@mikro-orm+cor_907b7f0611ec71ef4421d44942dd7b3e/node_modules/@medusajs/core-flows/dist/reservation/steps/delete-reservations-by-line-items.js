"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReservationsByLineItemsStep = exports.deleteReservationsByLineItemsStepId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const utils_1 = require("@medusajs/framework/utils");
exports.deleteReservationsByLineItemsStepId = "delete-reservations-by-line-items";
/**
 * This step deletes reservations by their associated line items.
 */
exports.deleteReservationsByLineItemsStep = (0, workflows_sdk_1.createStep)(exports.deleteReservationsByLineItemsStepId, async (ids, { container }) => {
    const service = container.resolve(utils_1.Modules.INVENTORY);
    await service.deleteReservationItemsByLineItem(ids);
    return new workflows_sdk_1.StepResponse(void 0, ids);
}, async (prevIds, { container }) => {
    if (!prevIds?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.INVENTORY);
    await service.restoreReservationItemsByLineItem(prevIds);
});
//# sourceMappingURL=delete-reservations-by-line-items.js.map