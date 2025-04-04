"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInviteStep = exports.createInviteStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.createInviteStepId = "create-invite-step";
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
exports.createInviteStep = (0, workflows_sdk_1.createStep)(exports.createInviteStepId, async (input, { container }) => {
    const service = container.resolve(utils_1.Modules.USER);
    const createdInvites = await service.createInvites(input);
    return new workflows_sdk_1.StepResponse(createdInvites, createdInvites.map((inv) => inv.id));
}, async (createdInvitesIds, { container }) => {
    if (!createdInvitesIds?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.USER);
    await service.deleteInvites(createdInvitesIds);
});
//# sourceMappingURL=create-invites.js.map