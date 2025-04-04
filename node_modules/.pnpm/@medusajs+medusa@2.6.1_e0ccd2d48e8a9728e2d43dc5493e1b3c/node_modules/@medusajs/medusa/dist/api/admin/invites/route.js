"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTHENTICATE = exports.POST = exports.GET = void 0;
const utils_1 = require("@medusajs/framework/utils");
const core_flows_1 = require("@medusajs/core-flows");
const helpers_1 = require("./helpers");
const GET = async (req, res) => {
    const remoteQuery = req.scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "invite",
        variables: {
            filters: req.filterableFields,
            ...req.queryConfig.pagination,
        },
        fields: req.queryConfig.fields,
    });
    const { rows: invites, metadata } = await remoteQuery(queryObject);
    res.json({
        invites,
        count: metadata.count,
        offset: metadata.skip,
        limit: metadata.take,
    });
};
exports.GET = GET;
const POST = async (req, res) => {
    const workflow = (0, core_flows_1.createInvitesWorkflow)(req.scope);
    const input = {
        input: {
            invites: [req.validatedBody],
        },
    };
    const { result } = await workflow.run(input);
    const invite = await (0, helpers_1.refetchInvite)(result[0].id, req.scope, req.queryConfig.fields);
    res.status(200).json({ invite });
};
exports.POST = POST;
exports.AUTHENTICATE = false;
//# sourceMappingURL=route.js.map