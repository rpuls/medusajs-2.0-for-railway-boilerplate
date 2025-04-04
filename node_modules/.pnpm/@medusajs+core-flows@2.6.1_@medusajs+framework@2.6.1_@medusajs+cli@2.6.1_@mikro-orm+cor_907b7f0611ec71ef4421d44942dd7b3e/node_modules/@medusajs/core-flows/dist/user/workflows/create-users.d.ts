import { UserDTO, UserWorkflow } from "@medusajs/framework/types";
export declare const createUsersWorkflowId = "create-users-workflow";
/**
 * This workflow creates one or more users. It's used by other workflows, such
 * as {@link acceptInviteWorkflow} to create a user for an invite.
 *
 * You can attach an auth identity to each user to allow the user to log in using the
 * {@link setAuthAppMetadataStep}. Learn more about auth identities in
 * [this documentation](https://docs.medusajs.com/resources/commerce-modules/auth/auth-identity-and-actor-types).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * create users within your custom flows.
 *
 * @example
 * const { result } = await createUsersWorkflow(container)
 * .run({
 *   input: {
 *     users: [{
 *       email: "example@gmail.com",
 *       first_name: "John",
 *       last_name: "Doe",
 *     }]
 *   }
 * })
 *
 * @summary
 *
 * Create one or more users.
 */
export declare const createUsersWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<UserWorkflow.CreateUsersWorkflowInputDTO, UserDTO[], []>;
//# sourceMappingURL=create-users.d.ts.map