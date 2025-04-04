"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRemoteLinksStep = exports.updateRemoteLinksStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.updateRemoteLinksStepId = "update-remote-links-step";
/**
 * This step updates remote links between two records of linked data models.
 *
 * Learn more in the [Remote Link documentation.](https://docs.medusajs.com/learn/fundamentals/module-links/remote-link#create-link).
 *
 * @example
 * const data = updateRemoteLinksStep([
 *   {
 *     [Modules.PRODUCT]: {
 *       product_id: "prod_321",
 *     },
 *     "helloModuleService": {
 *       my_custom_id: "mc_321",
 *     },
 *     data: {
 *       metadata: {
 *         test: false
 *       }
 *     }
 *   }
 * ])
 */
exports.updateRemoteLinksStep = (0, workflows_sdk_1.createStep)(exports.updateRemoteLinksStepId, async (data, { container }) => {
    if (!data?.length) {
        return new workflows_sdk_1.StepResponse([], []);
    }
    const link = container.resolve(utils_1.ContainerRegistrationKeys.LINK);
    // Fetch all existing links and throw an error if any weren't found
    const dataBeforeUpdate = (await link.list(data, {
        asLinkDefinition: true,
    }));
    const unequal = dataBeforeUpdate.length !== data.length;
    if (unequal) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `Could not find all existing links from data`);
    }
    // link.create here performs an upsert. By performing validation above, we can ensure
    // that this method will always perform an update in these cases
    await link.create(data);
    return new workflows_sdk_1.StepResponse(data, dataBeforeUpdate);
}, async (dataBeforeUpdate, { container }) => {
    if (!dataBeforeUpdate?.length) {
        return;
    }
    const link = container.resolve(utils_1.ContainerRegistrationKeys.LINK);
    await link.create(dataBeforeUpdate);
});
//# sourceMappingURL=update-remote-links.js.map