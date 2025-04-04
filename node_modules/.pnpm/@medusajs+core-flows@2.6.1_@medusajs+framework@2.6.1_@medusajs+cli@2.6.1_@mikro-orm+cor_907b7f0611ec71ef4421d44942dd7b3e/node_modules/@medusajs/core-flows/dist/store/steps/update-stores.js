"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStoresStep = exports.updateStoresStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.updateStoresStepId = "update-stores";
/**
 * This step updates stores matching the specified filters.
 *
 * @example
 * const data = updateStoresStep({
 *   selector: {
 *     id: "store_123"
 *   },
 *   update: {
 *     name: "Acme"
 *   }
 * })
 */
exports.updateStoresStep = (0, workflows_sdk_1.createStep)(exports.updateStoresStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.STORE);
    const { selects, relations } = (0, utils_1.getSelectsAndRelationsFromObjectArray)([
        data.update,
    ]);
    const prevData = await service.listStores(data.selector, {
        select: selects,
        relations,
    });
    const stores = await service.updateStores(data.selector, data.update);
    return new workflows_sdk_1.StepResponse(stores, prevData);
}, async (prevData, { container }) => {
    if (!prevData?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.STORE);
    await service.upsertStores(prevData.map((r) => ({
        ...r,
        metadata: r.metadata || undefined,
    })));
});
//# sourceMappingURL=update-stores.js.map