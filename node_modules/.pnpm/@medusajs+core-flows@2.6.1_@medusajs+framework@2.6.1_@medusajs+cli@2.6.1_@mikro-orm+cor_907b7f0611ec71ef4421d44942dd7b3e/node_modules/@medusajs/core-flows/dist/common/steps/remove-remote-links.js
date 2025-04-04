"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeRemoteLinkStep = exports.removeRemoteLinkStepId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const utils_1 = require("@medusajs/framework/utils");
exports.removeRemoteLinkStepId = "remove-remote-links";
/**
 * This step deletes linked records of a record.
 *
 * Learn more in the [Remote Link documentation](https://docs.medusajs.com/learn/fundamentals/module-links/remote-link#cascade-delete-linked-records)
 *
 * @example
 * removeRemoteLinkStep([{
 *   [Modules.PRODUCT]: {
 *     product_id: "prod_123",
 *   },
 * }])
 */
exports.removeRemoteLinkStep = (0, workflows_sdk_1.createStep)(exports.removeRemoteLinkStepId, async (data, { container }) => {
    const entries = Array.isArray(data) ? data : [data];
    if (!entries.length) {
        return new workflows_sdk_1.StepResponse(void 0);
    }
    const grouped = {};
    for (const entry of entries) {
        for (const moduleName of Object.keys(entry)) {
            grouped[moduleName] ??= {};
            for (const linkableKey of Object.keys(entry[moduleName])) {
                grouped[moduleName][linkableKey] ??= [];
                const keys = Array.isArray(entry[moduleName][linkableKey])
                    ? entry[moduleName][linkableKey]
                    : [entry[moduleName][linkableKey]];
                grouped[moduleName][linkableKey] = grouped[moduleName][linkableKey].concat(keys);
            }
        }
    }
    const link = container.resolve(utils_1.ContainerRegistrationKeys.LINK);
    await link.delete(grouped);
    return new workflows_sdk_1.StepResponse(grouped, grouped);
}, async (removedLinks, { container }) => {
    if (!removedLinks) {
        return;
    }
    const link = container.resolve(utils_1.ContainerRegistrationKeys.LINK);
    await link.restore(removedLinks);
});
//# sourceMappingURL=remove-remote-links.js.map