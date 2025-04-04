"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCartPromotionsWorkflow = exports.updateCartPromotionsWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../common");
const steps_1 = require("../steps");
const update_cart_promotions_1 = require("../steps/update-cart-promotions");
const fields_1 = require("../utils/fields");
exports.updateCartPromotionsWorkflowId = "update-cart-promotions";
/**
 * This workflow updates a cart's promotions, applying or removing promotion codes from the cart. It also computes the adjustments
 * that need to be applied to the cart's line items and shipping methods based on the promotions applied. This workflow is used by
 * [Add Promotions Store API Route](https://docs.medusajs.com/api/store#carts_postcartsidpromotions).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you to update a cart's promotions within your custom flows.
 *
 * @example
 * const { result } = await updateCartPromotionsWorkflow(container)
 * .run({
 *   input: {
 *     cart_id: "cart_123",
 *     promo_codes: ["10OFF"],
 *     // imported from @medusajs/framework/utils
 *     action: PromotionActions.ADD,
 *   }
 * })
 *
 * @summary
 *
 * Update a cart's applied promotions to add, replace, or remove them.
 *
 * @property hooks.validate - This hook is executed before all operations. You can consume this hook to perform any custom validation. If validation fails, you can throw an error to stop the workflow execution.
 */
exports.updateCartPromotionsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.updateCartPromotionsWorkflowId, (input) => {
    const fetchCart = (0, workflows_sdk_1.when)({ input }, ({ input }) => {
        return !input.cart;
    }).then(() => {
        return (0, common_1.useRemoteQueryStep)({
            entry_point: "cart",
            fields: fields_1.cartFieldsForRefreshSteps,
            variables: { id: input.cart_id },
            list: false,
        });
    });
    const cart = (0, workflows_sdk_1.transform)({ fetchCart, input }, ({ fetchCart, input }) => {
        return input.cart ?? fetchCart;
    });
    const validate = (0, workflows_sdk_1.createHook)("validate", {
        input,
        cart,
    });
    const promo_codes = (0, workflows_sdk_1.transform)({ input }, (data) => {
        return (data.input.promo_codes || []);
    });
    const action = (0, workflows_sdk_1.transform)({ input }, (data) => {
        return data.input.action || utils_1.PromotionActions.ADD;
    });
    const promotionCodesToApply = (0, steps_1.getPromotionCodesToApply)({
        cart: cart,
        promo_codes,
        action: action,
    });
    const actions = (0, steps_1.getActionsToComputeFromPromotionsStep)({
        cart,
        promotionCodesToApply,
    });
    const { lineItemAdjustmentsToCreate, lineItemAdjustmentIdsToRemove, shippingMethodAdjustmentsToCreate, shippingMethodAdjustmentIdsToRemove, computedPromotionCodes, } = (0, steps_1.prepareAdjustmentsFromPromotionActionsStep)({ actions });
    (0, workflows_sdk_1.parallelize)((0, steps_1.removeLineItemAdjustmentsStep)({ lineItemAdjustmentIdsToRemove }), (0, steps_1.removeShippingMethodAdjustmentsStep)({
        shippingMethodAdjustmentIdsToRemove,
    }), (0, steps_1.createLineItemAdjustmentsStep)({ lineItemAdjustmentsToCreate }), (0, steps_1.createShippingMethodAdjustmentsStep)({
        shippingMethodAdjustmentsToCreate,
    }), (0, update_cart_promotions_1.updateCartPromotionsStep)({
        id: cart.id,
        promo_codes: computedPromotionCodes,
        action: utils_1.PromotionActions.REPLACE,
    }));
    return new workflows_sdk_1.WorkflowResponse(void 0, {
        hooks: [validate],
    });
});
//# sourceMappingURL=update-cart-promotions.js.map