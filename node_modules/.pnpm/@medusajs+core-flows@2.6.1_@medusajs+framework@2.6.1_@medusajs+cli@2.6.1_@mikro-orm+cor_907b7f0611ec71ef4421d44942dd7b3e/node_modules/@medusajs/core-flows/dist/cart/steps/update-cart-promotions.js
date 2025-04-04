"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCartPromotionsStep = exports.updateCartPromotionsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.updateCartPromotionsStepId = "update-cart-promotions";
/**
 * This step updates the promotions applied on a cart.
 */
exports.updateCartPromotionsStep = (0, workflows_sdk_1.createStep)(exports.updateCartPromotionsStepId, async (data, { container }) => {
    const { promo_codes = [], id, action = utils_1.PromotionActions.ADD } = data;
    const remoteLink = container.resolve(utils_1.ContainerRegistrationKeys.LINK);
    const remoteQuery = container.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const promotionService = container.resolve(utils_1.Modules.PROMOTION);
    const existingCartPromotionLinks = await remoteQuery({
        entryPoint: "cart_promotion",
        fields: ["cart_id", "promotion_id"],
        variables: {
            cart_id: [id],
        },
    });
    const promotionLinkMap = new Map(existingCartPromotionLinks.map((link) => [link.promotion_id, link]));
    const linksToCreate = [];
    const linksToDismiss = [];
    if (promo_codes?.length) {
        const promotions = await promotionService.listPromotions({ code: promo_codes }, { select: ["id"] });
        for (const promotion of promotions) {
            const linkObject = {
                [utils_1.Modules.CART]: { cart_id: id },
                [utils_1.Modules.PROMOTION]: { promotion_id: promotion.id },
            };
            if ([utils_1.PromotionActions.ADD, utils_1.PromotionActions.REPLACE].includes(action)) {
                linksToCreate.push(linkObject);
            }
            if (action === utils_1.PromotionActions.REMOVE) {
                const link = promotionLinkMap.get(promotion.id);
                if (link) {
                    linksToDismiss.push(linkObject);
                }
            }
        }
    }
    if (action === utils_1.PromotionActions.REPLACE) {
        for (const link of existingCartPromotionLinks) {
            linksToDismiss.push({
                [utils_1.Modules.CART]: { cart_id: link.cart_id },
                [utils_1.Modules.PROMOTION]: { promotion_id: link.promotion_id },
            });
        }
    }
    if (linksToDismiss.length) {
        await remoteLink.dismiss(linksToDismiss);
    }
    const createdLinks = linksToCreate.length
        ? await remoteLink.create(linksToCreate)
        : [];
    return new workflows_sdk_1.StepResponse(null, {
        // @ts-expect-error
        createdLinkIds: createdLinks.map((link) => link.id),
        dismissedLinks: linksToDismiss,
    });
}, async (revertData, { container }) => {
    const remoteLink = container.resolve(utils_1.ContainerRegistrationKeys.LINK);
    if (revertData?.dismissedLinks?.length) {
        await remoteLink.create(revertData.dismissedLinks);
    }
    if (revertData?.createdLinkIds?.length) {
        // @ts-expect-error
        await remoteLink.delete(revertData.createdLinkIds);
    }
});
//# sourceMappingURL=update-cart-promotions.js.map