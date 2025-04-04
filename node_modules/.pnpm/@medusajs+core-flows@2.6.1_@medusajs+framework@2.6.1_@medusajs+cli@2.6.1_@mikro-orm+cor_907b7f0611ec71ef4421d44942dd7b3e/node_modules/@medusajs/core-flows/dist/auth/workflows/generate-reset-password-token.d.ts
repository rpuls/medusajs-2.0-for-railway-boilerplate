/**
 * This workflow generates a reset password token for a user. It's used by the
 * [Generate Reset Password Token for Admin](https://docs.medusajs.com/api/admin#auth_postactor_typeauth_providerresetpassword)
 * and [Generate Reset Password Token for Customer](https://docs.medusajs.com/api/store#auth_postactor_typeauth_providerresetpassword)
 * API Routes.
 *
 * The workflow emits the `auth.password_reset` event, which you can listen to in
 * a [subscriber](https://docs.medusajs.com/learn/fundamentals/events-and-subscribers). Follow
 * [this guide](https://docs.medusajs.com/resources/commerce-modules/auth/reset-password) to learn
 * how to handle this event.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * generate reset password tokens within your custom flows.
 *
 * @example
 * const { result } = await generateResetPasswordTokenWorkflow(container)
 * .run({
 *   input: {
 *     entityId: "example@gmail.com",
 *     actorType: "customer",
 *     provider: "emailpass",
 *     secret: "jwt_123" // jwt secret
 *   }
 * })
 *
 * @summary
 *
 * Generate a reset password token for a user or customer.
 */
export declare const generateResetPasswordTokenWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<{
    entityId: string;
    actorType: string;
    provider: string;
    secret: string;
}, string, []>;
//# sourceMappingURL=generate-reset-password-token.d.ts.map