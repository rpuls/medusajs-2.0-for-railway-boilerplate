"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateResetPasswordTokenWorkflow = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../common");
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
exports.generateResetPasswordTokenWorkflow = (0, workflows_sdk_1.createWorkflow)("generate-reset-password-token", (input) => {
    const providerIdentities = (0, common_1.useRemoteQueryStep)({
        entry_point: "provider_identity",
        fields: ["auth_identity_id", "provider_metadata"],
        variables: {
            filters: {
                entity_id: input.entityId,
                provider: input.provider,
            },
        },
    });
    const token = (0, workflows_sdk_1.transform)({ input, providerIdentities }, ({ input, providerIdentities }) => {
        const providerIdentity = providerIdentities?.[0];
        if (!providerIdentity) {
            throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Provider identity with entity_id ${input.entityId} and provider ${input.provider} not found`);
        }
        const token = (0, utils_1.generateJwtToken)({
            entity_id: input.entityId,
            provider: input.provider,
            actor_type: input.actorType,
        }, {
            secret: input.secret,
            expiresIn: "15m",
        });
        return token;
    });
    (0, common_1.emitEventStep)({
        eventName: utils_1.AuthWorkflowEvents.PASSWORD_RESET,
        data: {
            entity_id: input.entityId,
            actor_type: input.actorType,
            token,
        },
    });
    return new workflows_sdk_1.WorkflowResponse(token);
});
//# sourceMappingURL=generate-reset-password-token.js.map