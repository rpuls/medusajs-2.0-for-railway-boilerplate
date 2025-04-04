/**
 * The token to validate.
 */
export type ValidateTokenStepInput = string;
export declare const validateTokenStepId = "validate-invite-token-step";
/**
 * This step validates a specified token and returns its associated invite.
 * If not valid, the step throws an error.
 */
export declare const validateTokenStep: import("@medusajs/framework/workflows-sdk").StepFunction<string, import("@medusajs/framework/types").InviteDTO>;
//# sourceMappingURL=validate-token.d.ts.map