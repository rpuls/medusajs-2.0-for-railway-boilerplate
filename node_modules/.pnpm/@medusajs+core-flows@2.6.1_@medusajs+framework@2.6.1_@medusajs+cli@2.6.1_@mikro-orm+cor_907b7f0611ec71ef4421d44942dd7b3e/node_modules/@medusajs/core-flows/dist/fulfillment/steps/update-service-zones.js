"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateServiceZonesStep = exports.updateServiceZonesStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.updateServiceZonesStepId = "update-service-zones";
/**
 * This step updates service zones matching the specified filters.
 *
 * @example
 * const data = updateServiceZonesStep({
 *   selector: {
 *     id: "serzo_123"
 *   },
 *   update: {
 *     name: "US",
 *   }
 * })
 */
exports.updateServiceZonesStep = (0, workflows_sdk_1.createStep)(exports.updateServiceZonesStepId, async (input, { container }) => {
    const service = container.resolve(utils_1.Modules.FULFILLMENT);
    const { selects, relations } = (0, utils_1.getSelectsAndRelationsFromObjectArray)([
        input.update,
    ]);
    const prevData = await service.listServiceZones(input.selector, {
        select: selects,
        relations,
    });
    const updatedServiceZones = await service.updateServiceZones(input.selector, input.update);
    return new workflows_sdk_1.StepResponse(updatedServiceZones, prevData);
}, async (prevData, { container }) => {
    if (!prevData?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.FULFILLMENT);
    await service.upsertServiceZones(prevData);
});
//# sourceMappingURL=update-service-zones.js.map