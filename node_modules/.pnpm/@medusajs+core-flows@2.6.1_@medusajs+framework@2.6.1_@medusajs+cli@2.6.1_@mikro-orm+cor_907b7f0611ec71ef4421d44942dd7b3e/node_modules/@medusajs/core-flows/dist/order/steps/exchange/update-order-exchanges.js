"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderExchangesStep = exports.updateOrderExchangesStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.updateOrderExchangesStepId = "update-order-exchange";
/**
 * This step updates one or more exchanges.
 *
 * @example
 * const data = updateOrderExchangesStep([{
 *   "id": "exchange_123",
 *   no_notification: true
 * }])
 */
exports.updateOrderExchangesStep = (0, workflows_sdk_1.createStep)(exports.updateOrderExchangesStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.ORDER);
    const { selects, relations } = (0, utils_1.getSelectsAndRelationsFromObjectArray)(data, {
        objectFields: ["metadata"],
    });
    const dataBeforeUpdate = (await service.listOrderExchanges({ id: data.map((d) => d.id) }, { relations, select: selects }));
    const updated = await service.updateOrderExchanges(data.map((dt) => {
        const { id, ...rest } = dt;
        return {
            selector: { id },
            data: rest,
        };
    }));
    return new workflows_sdk_1.StepResponse(updated, dataBeforeUpdate);
}, async (dataBeforeUpdate, { container }) => {
    if (!dataBeforeUpdate?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.ORDER);
    await service.updateOrderExchanges(dataBeforeUpdate.map((dt) => {
        const { id, ...rest } = dt;
        return {
            selector: { id },
            data: rest,
        };
    }));
});
//# sourceMappingURL=update-order-exchanges.js.map