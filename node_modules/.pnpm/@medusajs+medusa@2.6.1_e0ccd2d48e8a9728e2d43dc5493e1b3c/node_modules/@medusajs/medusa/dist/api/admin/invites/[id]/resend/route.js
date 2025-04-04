"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTHENTICATE = exports.POST = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const helpers_1 = require("../../helpers");
const POST = async (req, res) => {
    const workflow = (0, core_flows_1.refreshInviteTokensWorkflow)(req.scope);
    const input = {
        invite_ids: [req.params.id],
    };
    const { result } = await workflow.run({ input });
    const invite = await (0, helpers_1.refetchInvite)(result[0].id, req.scope, req.queryConfig.fields);
    res.status(200).json({ invite });
};
exports.POST = POST;
exports.AUTHENTICATE = false;
//# sourceMappingURL=route.js.map