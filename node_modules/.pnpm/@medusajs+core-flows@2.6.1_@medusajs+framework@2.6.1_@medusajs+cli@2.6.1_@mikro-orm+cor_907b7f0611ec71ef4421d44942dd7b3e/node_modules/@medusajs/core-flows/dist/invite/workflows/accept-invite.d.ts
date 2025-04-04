import { InviteWorkflow, UserDTO } from "@medusajs/framework/types";
export declare const acceptInviteWorkflowId = "accept-invite-workflow";
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
export declare const acceptInviteWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<InviteWorkflow.AcceptInviteWorkflowInputDTO, UserDTO[], []>;
//# sourceMappingURL=accept-invite.d.ts.map