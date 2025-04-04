/**
 * The data to remove a user account.
 */
export type RemoveUserAccountWorkflowInput = {
    /**
     * The ID of the user to remove.
     */
    userId: string;
};
export declare const removeUserAccountWorkflowId = "remove-user-account";
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
export declare const removeUserAccountWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<RemoveUserAccountWorkflowInput, string, []>;
//# sourceMappingURL=remove-user-account.d.ts.map