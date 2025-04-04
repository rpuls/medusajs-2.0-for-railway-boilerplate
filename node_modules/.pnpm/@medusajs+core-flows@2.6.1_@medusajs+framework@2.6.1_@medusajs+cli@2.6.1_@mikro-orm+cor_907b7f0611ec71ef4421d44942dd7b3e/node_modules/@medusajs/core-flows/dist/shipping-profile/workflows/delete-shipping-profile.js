"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteShippingProfileWorkflow = exports.deleteShippingProfileWorkflowId = exports.validateStepShippingProfileDelete = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const utils_1 = require("@medusajs/framework/utils");
const steps_1 = require("../steps");
const common_1 = require("../../common");
/**
 * This step validates that the shipping profiles to delete are not linked to any products.
 * Otherwise, an error is thrown.
 *
 * @example
 * validateStepShippingProfileDelete({
 *   links: [
 *     {
 *       product_id: "product_123",
 *       shipping_profile_id: "sp_123"
 *     }
 *   ]
 * })
 */
exports.validateStepShippingProfileDelete = (0, workflows_sdk_1.createStep)("validate-step-shipping-profile-delete", (data) => {
    const { links } = data;
    if (links.length > 0) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Cannot delete following shipping profiles because they are linked to products: ${links
            .map((l) => l.product_id)
            .join(", ")}`);
    }
});
exports.deleteShippingProfileWorkflowId = "delete-shipping-profile-workflow";
/**
 * This workflow deletes one or more shipping profiles. It's used by the
 * [Delete Shipping Profile Admin API Route](https://docs.medusajs.com/api/admin#shipping-profiles_deleteshippingprofilesid).
 * Shipping profiles that are linked to products cannot be deleted.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * delete shipping profiles within your custom flows.
 *
 * @example
 * const { result } = await deleteShippingProfileWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["sp_123"]
 *   }
 * })
 *
 * @summary
 *
 * Delete shipping profiles.
 */
exports.deleteShippingProfileWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.deleteShippingProfileWorkflowId, (input) => {
    const currentShippingProfileLinks = (0, common_1.useQueryGraphStep)({
        entity: "product_shipping_profile",
        fields: ["product_id", "shipping_profile_id"],
        filters: { shipping_profile_id: input.ids },
    });
    (0, exports.validateStepShippingProfileDelete)({
        links: currentShippingProfileLinks.data,
    });
    (0, steps_1.deleteShippingProfilesStep)(input.ids);
    (0, common_1.removeRemoteLinkStep)({
        [utils_1.Modules.FULFILLMENT]: { shipping_profile_id: input.ids },
    });
});
//# sourceMappingURL=delete-shipping-profile.js.map