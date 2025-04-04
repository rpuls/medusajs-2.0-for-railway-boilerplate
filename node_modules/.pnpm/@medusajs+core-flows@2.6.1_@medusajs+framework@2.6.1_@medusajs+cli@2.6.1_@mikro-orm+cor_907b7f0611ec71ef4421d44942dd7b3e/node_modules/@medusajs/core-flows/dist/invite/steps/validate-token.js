"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTokenStep = exports.validateTokenStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.validateTokenStepId = "validate-invite-token-step";
/**
 * This step validates a specified token and returns its associated invite.
 * If not valid, the step throws an error.
 */
exports.validateTokenStep = (0, workflows_sdk_1.createStep)(exports.validateTokenStepId, async (input, { container }) => {
    const userModuleService = container.resolve(utils_1.Modules.USER);
    const invite = await userModuleService.validateInviteToken(input);
    return new workflows_sdk_1.StepResponse(invite);
});
//# sourceMappingURL=validate-token.js.map