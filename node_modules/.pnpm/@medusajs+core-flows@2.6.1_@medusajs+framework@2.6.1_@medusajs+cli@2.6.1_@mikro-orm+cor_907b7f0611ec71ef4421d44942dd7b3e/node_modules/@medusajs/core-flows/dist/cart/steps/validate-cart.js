"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCartStep = exports.validateCartStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.validateCartStepId = "validate-cart";
/**
 * This step validates a cart to ensure it exists and is not completed.
 * If not valid, the step throws an error.
 *
 * :::tip
 *
 * You can use the {@link retrieveCartStep} to retrieve a cart's details.
 *
 * :::
 *
 * @example
 * const data = validateCartStep({
 *   // retrieve the details of the cart from another workflow
 *   // or in another step using the Cart Module's service
 *   cart,
 * })
 */
exports.validateCartStep = (0, workflows_sdk_1.createStep)(exports.validateCartStepId, async (data) => {
    const { cart } = data;
    if (cart.completed_at) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Cart ${cart.id} is already completed.`);
    }
});
//# sourceMappingURL=validate-cart.js.map