"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentAccountHolderStep = exports.createPaymentAccountHolderStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.createPaymentAccountHolderStepId = "create-payment-account-holder";
/**
 * This step creates the account holder in the payment provider.
 *
 * @example
 * const accountHolder = createPaymentAccountHolderStep({
 *   provider_id: "pp_stripe_stripe",
 *   context: {
 *     customer: {
 *       id: "cus_123",
 *       email: "example@gmail.com"
 *     }
 *   }
 * })
 */
exports.createPaymentAccountHolderStep = (0, workflows_sdk_1.createStep)(exports.createPaymentAccountHolderStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.PAYMENT);
    const accountHolder = await service.createAccountHolder(data);
    return new workflows_sdk_1.StepResponse(accountHolder, accountHolder);
}, async (createdAccountHolder, { container }) => {
    if (!createdAccountHolder) {
        return;
    }
    const service = container.resolve(utils_1.Modules.PAYMENT);
    await service.deleteAccountHolder(createdAccountHolder.id);
});
//# sourceMappingURL=create-payment-account-holder.js.map