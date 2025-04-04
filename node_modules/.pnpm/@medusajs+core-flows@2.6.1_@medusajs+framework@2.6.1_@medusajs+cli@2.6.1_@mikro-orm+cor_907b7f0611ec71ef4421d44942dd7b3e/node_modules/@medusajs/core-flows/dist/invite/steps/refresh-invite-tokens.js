"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshInviteTokensStep = exports.refreshInviteTokensStepId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const utils_1 = require("@medusajs/framework/utils");
exports.refreshInviteTokensStepId = "refresh-invite-tokens-step";
/**
 * This step refreshes the tokens of one or more invites.
 */
exports.refreshInviteTokensStep = (0, workflows_sdk_1.createStep)(exports.refreshInviteTokensStepId, async (input, { container }) => {
    const service = container.resolve(utils_1.Modules.USER);
    const invites = await service.refreshInviteTokens(input);
    return new workflows_sdk_1.StepResponse(invites);
});
//# sourceMappingURL=refresh-invite-tokens.js.map