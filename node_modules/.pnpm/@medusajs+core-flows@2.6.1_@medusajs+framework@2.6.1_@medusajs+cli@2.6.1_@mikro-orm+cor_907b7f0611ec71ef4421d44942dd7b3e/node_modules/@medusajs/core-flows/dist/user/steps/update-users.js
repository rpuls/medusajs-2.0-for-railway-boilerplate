"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUsersStep = exports.updateUsersStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.updateUsersStepId = "update-users-step";
/**
 * This step updates one or more users.
 *
 * @example
 * const data = updateUsersStep([
 *   {
 *     id: "user_123",
 *     last_name: "Doe",
 *   }
 * ])
 */
exports.updateUsersStep = (0, workflows_sdk_1.createStep)(exports.updateUsersStepId, async (input, { container }) => {
    const service = container.resolve(utils_1.Modules.USER);
    if (!input.length) {
        return new workflows_sdk_1.StepResponse([], []);
    }
    const originalUsers = await service.listUsers({
        id: input.map((u) => u.id),
    });
    const users = await service.updateUsers(input);
    return new workflows_sdk_1.StepResponse(users, originalUsers);
}, async (originalUsers, { container }) => {
    if (!originalUsers?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.USER);
    await service.updateUsers(originalUsers.map((u) => ({
        id: u.id,
        first_name: u.first_name,
        last_name: u.last_name,
        email: u.email,
        avatar_url: u.avatar_url,
        metadata: u.metadata,
    })));
});
//# sourceMappingURL=update-users.js.map