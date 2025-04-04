"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStoresStep = exports.deleteStoresStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.deleteStoresStepId = "delete-stores";
/**
 * This step deletes one or more stores.
 */
exports.deleteStoresStep = (0, workflows_sdk_1.createStep)(exports.deleteStoresStepId, async (ids, { container }) => {
    const storeModule = container.resolve(utils_1.Modules.STORE);
    await storeModule.softDeleteStores(ids);
    return new workflows_sdk_1.StepResponse(void 0, ids);
}, async (idsToRestore, { container }) => {
    if (!idsToRestore?.length) {
        return;
    }
    const storeModule = container.resolve(utils_1.Modules.STORE);
    await storeModule.restoreStores(idsToRestore);
});
//# sourceMappingURL=delete-stores.js.map