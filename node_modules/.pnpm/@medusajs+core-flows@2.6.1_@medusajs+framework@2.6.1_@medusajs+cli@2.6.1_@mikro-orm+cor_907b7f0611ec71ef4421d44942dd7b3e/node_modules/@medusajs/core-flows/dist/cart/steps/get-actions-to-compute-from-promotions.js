"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActionsToComputeFromPromotionsStep = exports.getActionsToComputeFromPromotionsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.getActionsToComputeFromPromotionsStepId = "get-actions-to-compute-from-promotions";
/**
 * This step retrieves the actions to compute based on the promotions
 * applied on a cart.
 *
 * :::tip
 *
 * You can use the {@link retrieveCartStep} to retrieve a cart's details.
 *
 * :::
 *
 * @example
 * const data = getActionsToComputeFromPromotionsStep({
 *   // retrieve the details of the cart from another workflow
 *   // or in another step using the Cart Module's service
 *   cart,
 *   promotionCodesToApply: ["10OFF"]
 * })
 */
exports.getActionsToComputeFromPromotionsStep = (0, workflows_sdk_1.createStep)(exports.getActionsToComputeFromPromotionsStepId, async (data, { container }) => {
    const { cart, promotionCodesToApply = [] } = data;
    const promotionService = container.resolve(utils_1.Modules.PROMOTION);
    const actionsToCompute = await promotionService.computeActions(promotionCodesToApply, cart);
    return new workflows_sdk_1.StepResponse(actionsToCompute);
});
//# sourceMappingURL=get-actions-to-compute-from-promotions.js.map