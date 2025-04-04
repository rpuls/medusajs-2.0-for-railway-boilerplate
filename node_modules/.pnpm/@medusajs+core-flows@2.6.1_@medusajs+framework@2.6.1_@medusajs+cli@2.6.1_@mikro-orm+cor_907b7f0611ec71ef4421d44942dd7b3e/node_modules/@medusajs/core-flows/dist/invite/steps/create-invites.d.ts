import { CreateInviteDTO } from "@medusajs/framework/types";
export declare const createInviteStepId = "create-invite-step";
/**
 * This step creates one or more invites.
 *
 * @example
 * const data = createInviteStep([
 *   {
 *     email: "example@gmail.com"
 *   }
 * ])
 */
export declare const createInviteStep: import("@medusajs/framework/workflows-sdk").StepFunction<CreateInviteDTO[], import("@medusajs/framework/types").InviteDTO[]>;
//# sourceMappingURL=create-invites.d.ts.map