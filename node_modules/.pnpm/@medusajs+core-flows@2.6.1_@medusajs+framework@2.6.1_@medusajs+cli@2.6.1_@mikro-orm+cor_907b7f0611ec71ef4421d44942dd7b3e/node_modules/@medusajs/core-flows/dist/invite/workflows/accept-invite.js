"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.acceptInviteWorkflow = exports.acceptInviteWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const auth_1 = require("../../auth");
const emit_event_1 = require("../../common/steps/emit-event");
const user_1 = require("../../user");
const steps_1 = require("../steps");
const validate_token_1 = require("../steps/validate-token");
exports.acceptInviteWorkflowId = "accept-invite-workflow";
/**
 * This workflow accepts an invite and creates a user. It's used by the
 * [Accept Invite Admin API Route](https://docs.medusajs.com/api/admin#invites_postinvitesaccept).
 *
 * The workflow throws an error if the specified token is not valid. Also, the workflow
 * requires an auth identity to be created previously. You can create an auth identity
 * using the [Retrieve Registration JWT Token API Route](https://docs.medusajs.com/api/admin#auth_postactor_typeauth_provider_register).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * accept invites within your custom flows.
 *
 * @example
 * const { result } = await acceptInviteWorkflow(container)
 * .run({
 *   input: {
 *     invite_token: "sk_123",
 *     auth_identity_id: "au_123",
 *     user: {
 *       email: "example@gmail.com",
 *       first_name: "John",
 *       last_name: "Doe",
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Accept invite and create user.
 */
exports.acceptInviteWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.acceptInviteWorkflowId, (input) => {
    const invite = (0, validate_token_1.validateTokenStep)(input.invite_token);
    const createUserInput = (0, workflows_sdk_1.transform)({ input, invite }, ({ input, invite }) => {
        return [
            {
                ...input.user,
                email: input.user.email ?? invite.email,
            },
        ];
    });
    const users = user_1.createUsersWorkflow.runAsStep({
        input: {
            users: createUserInput,
        },
    });
    const authUserInput = (0, workflows_sdk_1.transform)({ input, users }, ({ input, users }) => {
        const createdUser = users[0];
        return {
            authIdentityId: input.auth_identity_id,
            actorType: "user",
            value: createdUser.id,
        };
    });
    (0, workflows_sdk_1.parallelize)((0, auth_1.setAuthAppMetadataStep)(authUserInput), (0, steps_1.deleteInvitesStep)([invite.id]), (0, emit_event_1.emitEventStep)({
        eventName: utils_1.InviteWorkflowEvents.ACCEPTED,
        data: { id: invite.id },
    }));
    return new workflows_sdk_1.WorkflowResponse(users);
});
//# sourceMappingURL=accept-invite.js.map