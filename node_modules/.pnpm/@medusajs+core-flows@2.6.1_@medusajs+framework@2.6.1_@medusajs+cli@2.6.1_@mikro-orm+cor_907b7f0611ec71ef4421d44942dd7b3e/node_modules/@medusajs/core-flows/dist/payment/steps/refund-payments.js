"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refundPaymentsStep = exports.refundPaymentsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.refundPaymentsStepId = "refund-payments-step";
/**
 * This step refunds one or more payments.
 */
exports.refundPaymentsStep = (0, workflows_sdk_1.createStep)(exports.refundPaymentsStepId, async (input, { container }) => {
    const logger = container.resolve(utils_1.ContainerRegistrationKeys.LOGGER);
    const paymentModule = container.resolve(utils_1.Modules.PAYMENT);
    const promises = [];
    for (const refundInput of input) {
        promises.push(paymentModule.refundPayment(refundInput).catch((e) => {
            logger.error(`Error was thrown trying to cancel payment - ${refundInput.payment_id} - ${e}`);
        }));
    }
    const successfulRefunds = (await (0, utils_1.promiseAll)(promises)).filter((payment) => (0, utils_1.isObject)(payment));
    return new workflows_sdk_1.StepResponse(successfulRefunds);
});
//# sourceMappingURL=refund-payments.js.map