import { InviteWorkflow } from "@medusajs/framework/types";
export declare const deleteInvitesWorkflowId = "delete-invites-workflow";
/**
 * This workflow deletes one or more user invites. It's used by the
 * [Delete Invites Admin API Route](https://docs.medusajs.com/api/admin#invites_deleteinvitesid).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * delete invites within your custom flows.
 *
 * @example
 * const { result } = await deleteInvitesWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["invite_123"]
 *   }
 * })
 *
 * @summary
 *
 * Delete one or more user invites.
 */
export declare const deleteInvitesWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<InviteWorkflow.DeleteInvitesWorkflowInput, unknown, any[]>;
//# sourceMappingURL=delete-invites.d.ts.map