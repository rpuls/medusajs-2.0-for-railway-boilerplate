"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUsersStep = exports.deleteUsersStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.deleteUsersStepId = "delete-users-step";
/**
 * This step deletes one or more users.
 */
exports.deleteUsersStep = (0, workflows_sdk_1.createStep)(exports.deleteUsersStepId, async (input, { container }) => {
    const service = container.resolve(utils_1.Modules.USER);
    await service.softDeleteUsers(input);
    return new workflows_sdk_1.StepResponse(void 0, input);
}, async (prevUserIds, { container }) => {
    if (!prevUserIds?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.USER);
    await service.restoreUsers(prevUserIds);
});
//# sourceMappingURL=delete-users.js.map