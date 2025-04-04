"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReservationsStep = exports.deleteReservationsStepId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const utils_1 = require("@medusajs/framework/utils");
exports.deleteReservationsStepId = "delete-reservations";
/**
 * This step deletes one or more reservations.
 */
exports.deleteReservationsStep = (0, workflows_sdk_1.createStep)(exports.deleteReservationsStepId, async (ids, { container }) => {
    const service = container.resolve(utils_1.Modules.INVENTORY);
    await service.softDeleteReservationItems(ids);
    return new workflows_sdk_1.StepResponse(void 0, ids);
}, async (prevIds, { container }) => {
    if (!prevIds?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.INVENTORY);
    await service.restoreReservationItems(prevIds);
});
//# sourceMappingURL=delete-reservations.js.map