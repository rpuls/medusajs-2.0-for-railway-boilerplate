import { UserWorkflow } from "@medusajs/framework/types";
export declare const deleteUsersWorkflowId = "delete-user";
/**
 * This workflow deletes one or more users. It's used by other workflows
 * like {@link removeUserAccountWorkflow}. If you use this workflow directly,
 * you must also remove the association to the auth identity using the
 * {@link setAuthAppMetadataStep}. Learn more about auth identities in
 * [this documentation](https://docs.medusajs.com/resources/commerce-modules/auth/auth-identity-and-actor-types).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * delete users within your custom flows.
 *
 * @example
 * const { result } = await deleteUsersWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["user_123"]
 *   }
 * })
 *
 * @summary
 *
 * Delete one or more users.
 */
export declare const deleteUsersWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<UserWorkflow.DeleteUserWorkflowInput, unknown, any[]>;
//# sourceMappingURL=delete-users.d.ts.map