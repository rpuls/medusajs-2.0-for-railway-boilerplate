"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDefaultStoreStep = exports.createDefaultStoreStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const store_1 = require("../../store");
exports.createDefaultStoreStepId = "create-default-store";
/**
 * This step creates a default store. Useful if creating a workflow
 * that seeds data into Medusa.
 *
 * @example
 * const data = createDefaultStoreStep({
 *   store: {
 *     name: "Acme",
 *     supported_currencies: [
 *       {
 *         currency_code: "usd",
 *         is_default: true
 *       }
 *     ],
 *   }
 * })
 */
exports.createDefaultStoreStep = (0, workflows_sdk_1.createStep)(exports.createDefaultStoreStepId, async (data, { container }) => {
    const storeService = container.resolve(utils_1.Modules.STORE);
    if (!storeService) {
        return new workflows_sdk_1.StepResponse(void 0);
    }
    let shouldDelete = false;
    let [store] = await storeService.listStores({}, { take: 1 });
    /**
     * @todo
     * Seems like we are missing an integration test when the
     * following conditional as true.
     */
    if (!store) {
        const stores = await (0, store_1.createStoresWorkflow)(container).run({
            input: {
                stores: [
                    {
                        // TODO: Revisit for a more sophisticated approach
                        ...data.store,
                        supported_currencies: [
                            { currency_code: "eur", is_default: true },
                        ],
                    },
                ],
            },
        });
        /**
         * As per types, the result from "createStoresWorkflow.run" was
         * an array of "StoreDTO". But at runtime it turns out to be
         * a "StoreDTO"
         */
        store = stores;
        shouldDelete = true;
    }
    return new workflows_sdk_1.StepResponse(store, { storeId: store.id, shouldDelete });
}, async (data, { container }) => {
    if (!data || !data.shouldDelete) {
        return;
    }
    const service = container.resolve(utils_1.Modules.STORE);
    await service.deleteStores(data.storeId);
});
//# sourceMappingURL=create-default-store.js.map