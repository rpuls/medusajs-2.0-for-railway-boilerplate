/**
 * The IDs of the invites to refresh.
 */
export type RefreshInviteTokensStepInput = string[];
export declare const refreshInviteTokensStepId = "refresh-invite-tokens-step";
/**
 * This step refreshes the tokens of one or more invites.
 */
export declare const refreshInviteTokensStep: import("@medusajs/framework/workflows-sdk").StepFunction<RefreshInviteTokensStepInput, import("@medusajs/framework/types").InviteDTO[]>;
//# sourceMappingURL=refresh-invite-tokens.d.ts.map