"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeCustomerAccountWorkflow = exports.removeCustomerAccountWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const auth_1 = require("../../auth");
const common_1 = require("../../common");
const delete_customers_1 = require("./delete-customers");
exports.removeCustomerAccountWorkflowId = "remove-customer-account";
/**
 * This workflow deletes a customer and remove its association to its auth identity. It's used by the
 * [Delete Customer Admin API Route](https://docs.medusajs.com/api/admin#customers_deletecustomersid).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * delete customer accounts within your custom flows.
 *
 * :::note
 *
 * This workflow uses the {@link deleteCustomersWorkflow} which has a hook that allows you to perform
 * custom actions after the customers are deleted.
 *
 * :::
 *
 * @example
 * const { result } = await removeCustomerAccountWorkflow(container)
 * .run({
 *   input: {
 *     customerId: "cus_123"
 *   }
 * })
 *
 * @summary
 *
 * Delete a customer account and its auth identity association.
 */
exports.removeCustomerAccountWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.removeCustomerAccountWorkflowId, (input) => {
    const customers = (0, common_1.useRemoteQueryStep)({
        entry_point: "customer",
        fields: ["id", "has_account"],
        variables: {
            id: input.customerId,
        },
    }).config({ name: "get-customer" });
    delete_customers_1.deleteCustomersWorkflow.runAsStep({
        input: {
            ids: [input.customerId],
        },
    });
    (0, workflows_sdk_1.when)({ customers }, ({ customers }) => {
        return !!customers[0]?.has_account;
    }).then(() => {
        const authIdentities = (0, common_1.useRemoteQueryStep)({
            entry_point: "auth_identity",
            fields: ["id"],
            variables: {
                filters: {
                    app_metadata: {
                        customer_id: input.customerId,
                    },
                },
            },
        });
        const authIdentity = (0, workflows_sdk_1.transform)({ authIdentities }, ({ authIdentities }) => {
            const authIdentity = authIdentities[0];
            if (!authIdentity) {
                throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, "Auth identity not found");
            }
            return authIdentity;
        });
        (0, auth_1.setAuthAppMetadataStep)({
            authIdentityId: authIdentity.id,
            actorType: "customer",
            value: null,
        });
    });
    return new workflows_sdk_1.WorkflowResponse(input.customerId);
});
//# sourceMappingURL=remove-customer-account.js.map