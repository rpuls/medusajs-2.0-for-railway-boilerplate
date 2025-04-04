"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReturnItemsStep = exports.updateReturnItemsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.updateReturnItemsStepId = "update-return-items";
/**
 * This step updates return items.
 *
 * @example
 * const data = updateReturnItemsStep([
 *   {
 *     id: "orli_123",
 *     quantity: 2
 *   }
 * ])
 */
exports.updateReturnItemsStep = (0, workflows_sdk_1.createStep)(exports.updateReturnItemsStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.ORDER);
    const { selects, relations } = (0, utils_1.getSelectsAndRelationsFromObjectArray)(data, {
        objectFields: ["metadata"],
    });
    const dataBeforeUpdate = await service.listReturnItems({ id: data.map((d) => d.id) }, { relations, select: selects });
    const updated = await service.updateReturnItems(data);
    return new workflows_sdk_1.StepResponse(updated, dataBeforeUpdate);
}, async (dataBeforeUpdate, { container }) => {
    if (!dataBeforeUpdate?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.ORDER);
    await service.updateReturnItems(dataBeforeUpdate);
});
//# sourceMappingURL=update-return-items.js.map