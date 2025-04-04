import { InviteDTO, InviteWorkflow } from "@medusajs/framework/types";
export declare const createInvitesWorkflowId = "create-invite-step";
/**
 * This workflow creates one or more user invites. It's used by the
 * [Create Invite Admin API Route](https://docs.medusajs.com/api/admin#invites_postinvites).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * create invites within your custom flows.
 *
 * @example
 * const { result } = await createInvitesWorkflow(container)
 * .run({
 *   input: {
 *     invites: [
 *       {
 *         email: "example@gmail.com"
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Create one or more user invites.
 */
export declare const createInvitesWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<InviteWorkflow.CreateInvitesWorkflowInputDTO, InviteDTO[], []>;
//# sourceMappingURL=create-invites.d.ts.map