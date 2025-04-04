"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dismissRemoteLinkStep = exports.dismissRemoteLinkStepId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const utils_1 = require("@medusajs/framework/utils");
// TODO: add ability for this step to restore links from only foreign keys
exports.dismissRemoteLinkStepId = "dismiss-remote-links";
/**
 * This step removes remote links between two records of linked data models.
 *
 * Learn more in the [Remote Link documentation.](https://docs.medusajs.com/learn/fundamentals/module-links/remote-link#dismiss-link).
 *
 * @example
 * dismissRemoteLinkStep([{
 *   [Modules.PRODUCT]: {
 *     product_id: "prod_123",
 *   },
 *   "helloModuleService": {
 *     my_custom_id: "mc_123",
 *   },
 * }])
 */
exports.dismissRemoteLinkStep = (0, workflows_sdk_1.createStep)(exports.dismissRemoteLinkStepId, async (data, { container }) => {
    const entries = Array.isArray(data) ? data : [data];
    if (!entries.length) {
        return new workflows_sdk_1.StepResponse([], []);
    }
    const link = container.resolve(utils_1.ContainerRegistrationKeys.LINK);
    // Our current revert strategy for dismissed links are to recreate it again.
    // This works when its just the primary keys, but when you have additional data
    // in the links, we need to preserve them in order to recreate the links accurately.
    const dataBeforeDismiss = (await link.list(data, {
        asLinkDefinition: true,
    }));
    await link.dismiss(entries);
    return new workflows_sdk_1.StepResponse(entries, dataBeforeDismiss);
}, async (dataBeforeDismiss, { container }) => {
    if (!dataBeforeDismiss?.length) {
        return;
    }
    const link = container.resolve(utils_1.ContainerRegistrationKeys.LINK);
    await link.create(dataBeforeDismiss);
});
//# sourceMappingURL=dismiss-remote-links.js.map