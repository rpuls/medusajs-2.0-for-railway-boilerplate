import { UserDTO, UserWorkflow } from "@medusajs/framework/types";
export declare const updateUsersWorkflowId = "update-users-workflow";
/**
 * This workflow updates one or more users. It's used by the
 * [Update User Admin API Route](https://docs.medusajs.com/api/admin#users_postusersid).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * update users within your custom flows.
 *
 * @example
 * const { result } = await updateUsersWorkflow(container)
 * .run({
 *   input: {
 *     updates: [
 *       {
 *         id: "user_123",
 *         first_name: "John"
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Update one or more users.
 */
export declare const updateUsersWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<UserWorkflow.UpdateUsersWorkflowInputDTO, UserDTO[], []>;
//# sourceMappingURL=update-users.d.ts.map