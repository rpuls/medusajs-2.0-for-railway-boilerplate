"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUsersStep = exports.createUsersStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.createUsersStepId = "create-users-step";
/**
 * This step creates one or more users. To allow these users to log in,
 * you must attach an auth identity to each user using the {@link setAuthAppMetadataStep}.
 *
 * @example
 * const data = createUsersStep([
 *   {
 *     email: "example@gmail.com",
 *     first_name: "John",
 *     last_name: "Doe",
 *   }
 * ])
 */
exports.createUsersStep = (0, workflows_sdk_1.createStep)(exports.createUsersStepId, async (input, { container }) => {
    const service = container.resolve(utils_1.Modules.USER);
    const users = await service.createUsers(input);
    return new workflows_sdk_1.StepResponse(users);
}, async (createdUsers, { container }) => {
    if (!createdUsers?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.USER);
    await service.deleteUsers(createdUsers.map((user) => user.id));
});
//# sourceMappingURL=create-users.js.map