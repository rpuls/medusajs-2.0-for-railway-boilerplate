"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteInvitesStep = exports.deleteInvitesStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.deleteInvitesStepId = "delete-invites-step";
/**
 * This step deletes one or more invites.
 */
exports.deleteInvitesStep = (0, workflows_sdk_1.createStep)(exports.deleteInvitesStepId, async (input, { container }) => {
    const service = container.resolve(utils_1.Modules.USER);
    await service.softDeleteInvites(input);
    return new workflows_sdk_1.StepResponse(void 0, input);
}, async (deletedInviteIds, { container }) => {
    if (!deletedInviteIds?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.USER);
    await service.restoreInvites(deletedInviteIds);
});
//# sourceMappingURL=delete-invites.js.map