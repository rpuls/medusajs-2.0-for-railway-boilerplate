"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCustomerAccountCreation = exports.validateCustomerAccountCreationStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.validateCustomerAccountCreationStepId = "validate-customer-account-creation";
/**
 * This step validates the input data for creating a customer account.
 * The step throws an error if:
 *
 * - The email is missing
 * - A customer with the email already exists and has an account
 * - A guest customer with the email already exists
 *
 * @example
 * const data = validateCustomerAccountCreation({
 *   authIdentityId: "au_1234",
 *   customerData: {
 *     first_name: "John",
 *     last_name: "Doe",
 *     email: "john.doe@example.com",
 *   }
 * })
 */
exports.validateCustomerAccountCreation = (0, workflows_sdk_1.createStep)(exports.validateCustomerAccountCreationStepId, async (input, { container }) => {
    const customerService = container.resolve(utils_1.Modules.CUSTOMER);
    const { email } = input.customerData;
    if (!email) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, "Email is required to create a customer");
    }
    // Check if customer with email already exists
    const existingCustomers = await customerService.listCustomers({ email });
    if (existingCustomers?.length) {
        const hasExistingAccount = existingCustomers.some((customer) => customer.has_account);
        if (hasExistingAccount && input.authIdentityId) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.DUPLICATE_ERROR, "Customer with this email already has an account");
        }
        if (!hasExistingAccount && !input.authIdentityId) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.DUPLICATE_ERROR, "Guest customer with this email already exists");
        }
    }
});
//# sourceMappingURL=validate-customer-account-creation.js.map