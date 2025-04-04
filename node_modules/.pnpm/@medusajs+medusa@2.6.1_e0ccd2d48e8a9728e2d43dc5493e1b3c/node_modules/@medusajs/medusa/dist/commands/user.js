"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const logger_1 = require("@medusajs/framework/logger");
const utils_1 = require("@medusajs/framework/utils");
const express_1 = __importDefault(require("express"));
const telemetry_1 = require("@medusajs/telemetry");
const loaders_1 = __importDefault(require("../loaders"));
async function default_1({ directory, id, email, password, keepAlive, invite, }) {
    (0, telemetry_1.track)("CLI_USER", { with_id: !!id });
    const app = (0, express_1.default)();
    try {
        /**
         * Enabling worker mode to prevent discovering/loading
         * of API routes from the starter kit
         */
        process.env.MEDUSA_WORKER_MODE = "worker";
        const { container } = await (0, loaders_1.default)({
            directory,
            expressApp: app,
        });
        const userService = container.resolve(utils_1.Modules.USER);
        const authService = container.resolve(utils_1.Modules.AUTH);
        const provider = "emailpass";
        if (invite) {
            const invite = await userService.createInvites({ email });
            logger_1.logger.info(`
      Invite token: ${invite.token}
      Open the invite in Medusa Admin at: [your-admin-url]/invite?token=${invite.token}`);
        }
        else {
            const user = await userService.createUsers({ email });
            const { authIdentity, error } = await authService.register(provider, {
                body: {
                    email,
                    password,
                },
            });
            if (error) {
                logger_1.logger.error(error);
                process.exit(1);
            }
            // We know the authIdentity is not undefined
            await authService.updateAuthIdentities({
                id: authIdentity.id,
                app_metadata: {
                    user_id: user.id,
                },
            });
            logger_1.logger.info("User created successfully.");
        }
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
    (0, telemetry_1.track)("CLI_USER_COMPLETED", { with_id: !!id });
    if (!keepAlive) {
        process.exit();
    }
}
//# sourceMappingURL=user.js.map