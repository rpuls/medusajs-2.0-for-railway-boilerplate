"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserEvents = void 0;
const event_bus_1 = require("../event-bus");
const modules_sdk_1 = require("../modules-sdk");
const eventBaseNames = ["user", "invite"];
exports.UserEvents = {
    ...(0, event_bus_1.buildEventNamesFromEntityName)(eventBaseNames, modules_sdk_1.Modules.USER),
    INVITE_TOKEN_GENERATED: `${modules_sdk_1.Modules.USER}.user.invite.token_generated`,
};
//# sourceMappingURL=events.js.map