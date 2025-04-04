"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTHENTICATE = exports.GET = void 0;
const utils_1 = require("@medusajs/framework/utils");
const GET = async (req, res) => {
    const id = req.auth_context.actor_id;
    const remoteQuery = req.scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    if (!id) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `User ID not found`);
    }
    const query = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "user",
        variables: { id },
        fields: req.queryConfig.fields,
    });
    const [user] = await remoteQuery(query);
    if (!user) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `User with id: ${id} was not found`);
    }
    res.status(200).json({ user });
};
exports.GET = GET;
exports.AUTHENTICATE = false;
//# sourceMappingURL=route.js.map