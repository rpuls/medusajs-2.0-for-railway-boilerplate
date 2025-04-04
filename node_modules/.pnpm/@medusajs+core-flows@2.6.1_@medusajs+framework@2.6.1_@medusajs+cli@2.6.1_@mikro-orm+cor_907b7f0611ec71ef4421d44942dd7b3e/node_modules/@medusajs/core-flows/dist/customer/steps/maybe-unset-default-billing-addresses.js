"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maybeUnsetDefaultBillingAddressesStep = exports.maybeUnsetDefaultBillingAddressesStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const utils_2 = require("./utils");
exports.maybeUnsetDefaultBillingAddressesStepId = "maybe-unset-default-billing-customer-addresses";
/**
 * This step unsets the `is_default_billing` property of existing customer addresses
 * if the `is_default_billing` property in the addresses in the input is set to `true`.
 *
 * @example
 * const data = maybeUnsetDefaultBillingAddressesStep({
 *   create: [{
 *     customer_id: "cus_123",
 *     first_name: "John",
 *     last_name: "Doe",
 *     address_1: "123 Main St",
 *     city: "Anytown",
 *     country_code: "US",
 *     postal_code: "12345",
 *     phone: "555-555-5555"
 *     is_default_billing: true
 *   }],
 *   update: {
 *     selector: {
 *       customer_id: "cus_123"
 *     },
 *     update: {
 *       is_default_billing: true
 *     }
 *   }
 * })
 */
exports.maybeUnsetDefaultBillingAddressesStep = (0, workflows_sdk_1.createStep)(exports.maybeUnsetDefaultBillingAddressesStepId, async (data, { container }) => {
    const customerModuleService = container.resolve(utils_1.Modules.CUSTOMER);
    if ((0, utils_1.isDefined)(data.create)) {
        return (0, utils_2.unsetForCreate)(data.create, customerModuleService, "is_default_billing");
    }
    if ((0, utils_1.isDefined)(data.update)) {
        return (0, utils_2.unsetForUpdate)(data.update, customerModuleService, "is_default_billing");
    }
    throw new Error("Invalid step input");
}, async (addressesToSet, { container }) => {
    if (!addressesToSet?.length) {
        return;
    }
    const customerModuleService = container.resolve(utils_1.Modules.CUSTOMER);
    await customerModuleService.updateCustomerAddresses({ id: addressesToSet }, { is_default_billing: true });
});
//# sourceMappingURL=maybe-unset-default-billing-addresses.js.map