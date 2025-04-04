"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findOrCreateCustomerStep = exports.findOrCreateCustomerStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.findOrCreateCustomerStepId = "find-or-create-customer";
/**
 * This step either finds a customer matching the specified ID, or finds / create a customer
 * matching the specified email. If both ID and email are provided, ID takes precedence.
 * If the customer is a guest, the email is updated to the provided email.
 */
exports.findOrCreateCustomerStep = (0, workflows_sdk_1.createStep)(exports.findOrCreateCustomerStepId, async (data, { container }) => {
    if (!(0, utils_1.isDefined)(data.customerId) && !(0, utils_1.isDefined)(data.email)) {
        return new workflows_sdk_1.StepResponse({
            customer: undefined,
            email: undefined,
        }, {
            customerWasCreated: false,
        });
    }
    const service = container.resolve(utils_1.Modules.CUSTOMER);
    const customerData = {
        customer: null,
        email: null,
    };
    let originalCustomer = null;
    let customerWasCreated = false;
    if (data.customerId) {
        originalCustomer = await service.retrieveCustomer(data.customerId);
        customerData.customer = originalCustomer;
        customerData.email = originalCustomer.email;
    }
    if (data.email) {
        const validatedEmail = (data.email && (0, utils_1.validateEmail)(data.email));
        let [customer] = originalCustomer
            ? [originalCustomer]
            : await service.listCustomers({
                email: validatedEmail,
            });
        // if NOT a guest customer, return it
        if (customer?.has_account) {
            customerData.customer = customer;
            customerData.email = customer.email;
            return new workflows_sdk_1.StepResponse(customerData, {
                customerWasCreated,
            });
        }
        if (!customer ||
            ((0, utils_1.isDefined)(data.email) && customer.email !== validatedEmail)) {
            customer = await service.createCustomers({ email: validatedEmail });
            customerWasCreated = true;
        }
        originalCustomer = customer;
        customerData.customer = customer;
        customerData.email = customer.email;
    }
    return new workflows_sdk_1.StepResponse(customerData, {
        customer: originalCustomer,
        customerWasCreated,
    });
}, async (compData, { container }) => {
    const { customer, customerWasCreated } = compData;
    if (!customerWasCreated || !customer?.id) {
        return;
    }
    const service = container.resolve(utils_1.Modules.CUSTOMER);
    await service.deleteCustomers(customer.id);
});
//# sourceMappingURL=find-or-create-customer.js.map