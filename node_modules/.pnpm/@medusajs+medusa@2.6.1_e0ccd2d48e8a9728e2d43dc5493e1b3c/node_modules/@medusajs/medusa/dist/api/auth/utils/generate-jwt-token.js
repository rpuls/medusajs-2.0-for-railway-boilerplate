"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateJwtTokenForAuthIdentity = generateJwtTokenForAuthIdentity;
const utils_1 = require("@medusajs/framework/utils");
function generateJwtTokenForAuthIdentity({ authIdentity, actorType, }, { secret, expiresIn, }) {
    const entityIdKey = `${actorType}_id`;
    const entityId = authIdentity?.app_metadata?.[entityIdKey];
    return (0, utils_1.generateJwtToken)({
        actor_id: entityId ?? "",
        actor_type: actorType,
        auth_identity_id: authIdentity?.id ?? "",
        app_metadata: {
            [entityIdKey]: entityId,
        },
    }, {
        secret,
        expiresIn,
    });
}
//# sourceMappingURL=generate-jwt-token.js.map