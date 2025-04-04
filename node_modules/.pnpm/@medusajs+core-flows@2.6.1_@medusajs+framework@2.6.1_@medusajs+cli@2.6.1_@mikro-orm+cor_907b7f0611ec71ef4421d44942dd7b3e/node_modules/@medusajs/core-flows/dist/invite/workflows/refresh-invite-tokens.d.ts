import { InviteDTO, InviteWorkflow } from "@medusajs/framework/types";
export declare const refreshInviteTokensWorkflowId = "refresh-invite-tokens-workflow";
/**
 * This workflow refreshes the token of one or more user invites, updating the
 * token and the expiry date. It's used by the
 * [Refresh Invite Token Admin API Route](https://docs.medusajs.com/api/admin#invites_postinvitesidresend).
 *
 * This workflow is useful to trigger resending invite tokens. It emits the `invite.resent` event,
 * which you can listen to in a [Subscriber](https://docs.medusajs.com/learn/fundamentals/events-and-subscribers).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * refresh invite tokens within your custom flows.
 *
 * @example
 * const { result } = await refreshInviteTokensWorkflow(container)
 * .run({
 *   input: {
 *     invite_ids: ["invite_123"]
 *   }
 * })
 *
 * @summary
 *
 * Refresh user invite tokens.
 */
export declare const refreshInviteTokensWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<InviteWorkflow.ResendInvitesWorkflowInputDTO, InviteDTO[], []>;
//# sourceMappingURL=refresh-invite-tokens.d.ts.map