"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = assignProductsToShippingProfile;
const core_flows_1 = require("@medusajs/core-flows");
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const workflows_sdk_2 = require("@medusajs/framework/workflows-sdk");
const assignProductsToShippingProfileWorkflow = (0, workflows_sdk_2.createWorkflow)("assign-products-to-shipping-profile", () => {
    const { data: shippingProfiles } = (0, core_flows_1.useQueryGraphStep)({
        entity: "shipping_profile",
        fields: ["id", "name"],
    }).config({ name: "get-shipping-profiles" });
    const { data: products } = (0, core_flows_1.useQueryGraphStep)({
        entity: "product",
        fields: ["id"],
    }).config({ name: "get-products" });
    const shippingProfileId = (0, workflows_sdk_1.transform)({ shippingProfiles }, ({ shippingProfiles }) => shippingProfiles.find((sp) => sp.name.toLocaleLowerCase().includes("default"))?.id ?? shippingProfiles[0]?.id);
    const createdShippingProfileId = (0, workflows_sdk_1.when)("create-shipping-profile", {
        shippingProfileId,
    }, ({ shippingProfileId }) => !shippingProfileId).then(() => {
        const createdShippingProfiles = (0, core_flows_1.createShippingProfilesStep)([
            {
                name: "Default Shipping Profile",
                type: "default",
            },
        ]);
        return createdShippingProfiles[0].id;
    });
    const links = (0, workflows_sdk_1.transform)({ products, shippingProfileId, createdShippingProfileId }, ({ products, shippingProfileId, createdShippingProfileId }) => {
        return products.map((product) => ({
            [utils_1.Modules.PRODUCT]: {
                product_id: product.id,
            },
            [utils_1.Modules.FULFILLMENT]: {
                shipping_profile_id: shippingProfileId ?? createdShippingProfileId,
            },
        }));
    });
    (0, core_flows_1.createRemoteLinkStep)(links);
    return new workflows_sdk_1.WorkflowResponse(void 0);
});
async function assignProductsToShippingProfile({ container, }) {
    const logger = container.resolve(utils_1.ContainerRegistrationKeys.LOGGER);
    logger.info("Assigning products to shipping profile");
    await assignProductsToShippingProfileWorkflow(container)
        .run()
        .then(() => {
        logger.info("Products assigned to shipping profile");
    })
        .catch((e) => {
        logger.error(e);
    });
}
//# sourceMappingURL=migrate-product-shipping-profile.js.map