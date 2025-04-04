"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTHENTICATE = exports.DELETE = exports.GET = void 0;
const utils_1 = require("@medusajs/framework/utils");
const core_flows_1 = require("@medusajs/core-flows");
const helpers_1 = require("../helpers");
const GET = async (req, res) => {
    const { id } = req.params;
    const invite = await (0, helpers_1.refetchInvite)(id, req.scope, req.queryConfig.fields);
    if (!invite) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `Invite with id: ${id} was not found`);
    }
    res.status(200).json({ invite });
};
exports.GET = GET;
const DELETE = async (req, res) => {
    const { id } = req.params;
    const workflow = (0, core_flows_1.deleteInvitesWorkflow)(req.scope);
    await workflow.run({
        input: { ids: [id] },
    });
    res.status(200).json({
        id,
        object: "invite",
        deleted: true,
    });
};
exports.DELETE = DELETE;
exports.AUTHENTICATE = false;
//# sourceMappingURL=route.js.map