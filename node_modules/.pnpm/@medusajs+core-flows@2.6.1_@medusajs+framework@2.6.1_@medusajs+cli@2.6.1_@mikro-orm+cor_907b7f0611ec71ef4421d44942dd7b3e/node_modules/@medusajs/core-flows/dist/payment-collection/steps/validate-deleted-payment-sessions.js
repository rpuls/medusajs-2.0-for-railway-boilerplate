"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDeletedPaymentSessionsStep = exports.validateDeletedPaymentSessionsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.validateDeletedPaymentSessionsStepId = "validate-deleted-payment-sessions";
/**
 * This step validates that the specified payment session IDs were deleted.
 * If not all payment sessions were deleted, the step throws an error.
 *
 * @example
 * const data = validateDeletedPaymentSessionsStep({
 *   idsDeleted: ["pay_123"],
 *   idsToDelete: ["pay_123"]
 * })
 */
exports.validateDeletedPaymentSessionsStep = (0, workflows_sdk_1.createStep)(exports.validateDeletedPaymentSessionsStepId, async (input) => {
    const { idsToDelete = [], idsDeleted = [] } = input;
    if (idsToDelete.length !== idsDeleted.length) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.UNEXPECTED_STATE, `Could not delete all payment sessions`);
    }
    return new workflows_sdk_1.StepResponse(void 0);
});
//# sourceMappingURL=validate-deleted-payment-sessions.js.map