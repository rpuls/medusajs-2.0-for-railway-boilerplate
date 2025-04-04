"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserAccountWorkflow = exports.createUserAccountWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const auth_1 = require("../../auth");
const create_users_1 = require("./create-users");
exports.createUserAccountWorkflowId = "create-user-account";
/**
 * This workflow creates a user and attaches it to an auth identity.
 *
 * You can create an auth identity first using the [Retrieve Registration JWT Token API Route](https://docs.medusajs.com/api/admin#auth_postactor_typeauth_provider_register).
 * Learn more about basic authentication flows in [this documentation](https://docs.medusajs.com/resources/commerce-modules/auth/authentication-route).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * register or create user accounts within your custom flows.
 *
 * @example
 * const { result } = await createUserAccountWorkflow(container)
 * .run({
 *   input: {
 *     authIdentityId: "au_123",
 *     userData: {
 *       email: "example@gmail.com",
 *       first_name: "John",
 *       last_name: "Doe",
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Create a user account and attach an auth identity.
 */
exports.createUserAccountWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.createUserAccountWorkflowId, (input) => {
    const users = create_users_1.createUsersWorkflow.runAsStep({
        input: {
            users: [input.userData],
        },
    });
    const user = (0, workflows_sdk_1.transform)(users, (users) => users[0]);
    (0, auth_1.setAuthAppMetadataStep)({
        authIdentityId: input.authIdentityId,
        actorType: "user",
        value: user.id,
    });
    return new workflows_sdk_1.WorkflowResponse(user);
});
//# sourceMappingURL=create-user-account.js.map