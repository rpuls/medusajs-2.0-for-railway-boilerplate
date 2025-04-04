"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStoresStep = exports.createStoresStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.createStoresStepId = "create-stores";
/**
 * This step creates one or more stores.
 *
 * @example
 * const data = createStoresStep([{
 *   name: "Acme"
 * }])
 */
exports.createStoresStep = (0, workflows_sdk_1.createStep)(exports.createStoresStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.STORE);
    const created = await service.createStores(data);
    return new workflows_sdk_1.StepResponse(created, created.map((store) => store.id));
}, async (createdIds, { container }) => {
    if (!createdIds?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.STORE);
    await service.deleteStores(createdIds);
});
//# sourceMappingURL=create-stores.js.map