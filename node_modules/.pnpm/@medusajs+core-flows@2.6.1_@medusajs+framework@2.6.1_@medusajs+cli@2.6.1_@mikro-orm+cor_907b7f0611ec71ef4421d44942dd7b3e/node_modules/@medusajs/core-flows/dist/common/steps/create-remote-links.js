"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRemoteLinkStep = exports.createLinksStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.createLinksStepId = "create-remote-links";
/**
 * This step creates remote links between two records of linked data models.
 *
 * Learn more in the [Remote Link documentation.](https://docs.medusajs.com/learn/fundamentals/module-links/remote-link#create-link).
 *
 * @example
 * createRemoteLinkStep([{
 *   [Modules.PRODUCT]: {
 *     product_id: "prod_123",
 *   },
 *   "helloModuleService": {
 *     my_custom_id: "mc_123",
 *   },
 * }])
 */
exports.createRemoteLinkStep = (0, workflows_sdk_1.createStep)(exports.createLinksStepId, async (data, { container }) => {
    const link = container.resolve(utils_1.ContainerRegistrationKeys.LINK);
    if (!data.length) {
        return new workflows_sdk_1.StepResponse([], []);
    }
    await link.create(data);
    return new workflows_sdk_1.StepResponse(data, data);
}, async (createdLinks, { container }) => {
    if (!createdLinks) {
        return;
    }
    const link = container.resolve(utils_1.ContainerRegistrationKeys.LINK);
    await link.dismiss(createdLinks);
});
//# sourceMappingURL=create-remote-links.js.map