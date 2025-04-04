"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCustomerAccountWorkflow = exports.createCustomerAccountWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const auth_1 = require("../../auth");
const validate_customer_account_creation_1 = require("../steps/validate-customer-account-creation");
const create_customers_1 = require("./create-customers");
exports.createCustomerAccountWorkflowId = "create-customer-account";
/**
 * This workflow creates a customer and attaches it to an auth identity. It's used by the
 * [Register Customer Store API Route](https://docs.medusajs.com/api/store#customers_postcustomers).
 *
 * You can create an auth identity first using the [Retrieve Registration JWT Token API Route](https://docs.medusajs.com/api/store#auth_postactor_typeauth_provider_register).
 * Learn more about basic authentication flows in [this documentation](https://docs.medusajs.com/resources/commerce-modules/auth/authentication-route).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * register or create customer accounts within your custom flows.
 *
 * @example
 * const { result } = await createCustomerAccountWorkflow(container)
 * .run({
 *   input: {
 *     authIdentityId: "au_1234",
 *     customerData: {
 *       first_name: "John",
 *       last_name: "Doe",
 *       email: "john.doe@example.com",
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Create or register a customer account.
 */
exports.createCustomerAccountWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.createCustomerAccountWorkflowId, (input) => {
    (0, validate_customer_account_creation_1.validateCustomerAccountCreation)(input);
    const customerData = (0, workflows_sdk_1.transform)({ input }, (data) => {
        return {
            ...data.input.customerData,
            has_account: !!data.input.authIdentityId,
        };
    });
    const customers = create_customers_1.createCustomersWorkflow.runAsStep({
        input: {
            customersData: [customerData],
        },
    });
    const customer = (0, workflows_sdk_1.transform)(customers, (customers) => customers[0]);
    (0, auth_1.setAuthAppMetadataStep)({
        authIdentityId: input.authIdentityId,
        actorType: "customer",
        value: customer.id,
    });
    return new workflows_sdk_1.WorkflowResponse(customer);
});
//# sourceMappingURL=create-customer-account.js.map