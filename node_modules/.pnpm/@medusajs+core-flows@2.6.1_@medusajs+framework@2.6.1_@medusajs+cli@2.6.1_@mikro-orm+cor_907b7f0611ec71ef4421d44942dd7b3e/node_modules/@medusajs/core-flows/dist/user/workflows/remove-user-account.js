"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeUserAccountWorkflow = exports.removeUserAccountWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const auth_1 = require("../../auth");
const common_1 = require("../../common");
const delete_users_1 = require("./delete-users");
exports.removeUserAccountWorkflowId = "remove-user-account";
/**
 * This workflow deletes a user and remove the association to its auth identity. It's used
 * by the [Delete User Admin API Route](https://docs.medusajs.com/api/admin#users_deleteusersid).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * delete users within your custom flows.
 *
 * @example
 * const { result } = await removeUserAccountWorkflow(container)
 * .run({
 *   input: {
 *     userId: "user_123"
 *   }
 * })
 *
 * @summary
 *
 * Delete a user and remove the association to its auth identity.
 */
exports.removeUserAccountWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.removeUserAccountWorkflowId, (input) => {
    delete_users_1.deleteUsersWorkflow.runAsStep({
        input: {
            ids: [input.userId],
        },
    });
    const authIdentities = (0, common_1.useRemoteQueryStep)({
        entry_point: "auth_identity",
        fields: ["id"],
        variables: {
            filters: {
                app_metadata: {
                    user_id: input.userId,
                },
            },
        },
    });
    const authIdentity = (0, workflows_sdk_1.transform)({ authIdentities, input }, ({ authIdentities }) => {
        return authIdentities[0];
    });
    (0, workflows_sdk_1.when)({ authIdentity }, ({ authIdentity }) => {
        return !!authIdentity;
    }).then(() => {
        (0, auth_1.setAuthAppMetadataStep)({
            authIdentityId: authIdentity.id,
            actorType: "user",
            value: null,
        });
    });
    return new workflows_sdk_1.WorkflowResponse(input.userId);
});
//# sourceMappingURL=remove-user-account.js.map