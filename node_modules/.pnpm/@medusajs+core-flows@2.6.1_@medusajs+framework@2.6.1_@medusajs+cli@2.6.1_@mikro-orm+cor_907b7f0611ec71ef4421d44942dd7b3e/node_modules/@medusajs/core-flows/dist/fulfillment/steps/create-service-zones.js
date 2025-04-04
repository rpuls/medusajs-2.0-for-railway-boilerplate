"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServiceZonesStep = exports.createServiceZonesStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.createServiceZonesStepId = "create-service-zones";
/**
 * This step creates one or more service zones.
 */
exports.createServiceZonesStep = (0, workflows_sdk_1.createStep)(exports.createServiceZonesStepId, async (input, { container }) => {
    const service = container.resolve(utils_1.Modules.FULFILLMENT);
    const createdServiceZones = await service.createServiceZones(input);
    return new workflows_sdk_1.StepResponse(createdServiceZones, createdServiceZones.map((createdZone) => createdZone.id));
}, async (createdServiceZones, { container }) => {
    if (!createdServiceZones?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.FULFILLMENT);
    await service.deleteServiceZones(createdServiceZones);
});
//# sourceMappingURL=create-service-zones.js.map