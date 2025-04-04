"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTHENTICATE = exports.DELETE = exports.POST = exports.GET = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const utils_1 = require("@medusajs/framework/utils");
const helpers_1 = require("../helpers");
// Get user
const GET = async (req, res) => {
    const remoteQuery = req.scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const { id } = req.params;
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
// update user
const POST = async (req, res) => {
    const workflow = (0, core_flows_1.updateUsersWorkflow)(req.scope);
    const input = {
        updates: [
            {
                id: req.params.id,
                ...req.validatedBody,
            },
        ],
    };
    await workflow.run({ input });
    const user = await (0, helpers_1.refetchUser)(req.params.id, req.scope, req.queryConfig.fields);
    res.status(200).json({ user });
};
exports.POST = POST;
// delete user
const DELETE = async (req, res) => {
    const { id } = req.params;
    const { actor_id } = req.auth_context;
    if (actor_id !== id) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_ALLOWED, "You are not allowed to delete other users");
    }
    const workflow = (0, core_flows_1.removeUserAccountWorkflow)(req.scope);
    await workflow.run({
        input: { userId: id },
    });
    res.status(200).json({
        id,
        object: "user",
        deleted: true,
    });
};
exports.DELETE = DELETE;
exports.AUTHENTICATE = false;
//# sourceMappingURL=route.js.map