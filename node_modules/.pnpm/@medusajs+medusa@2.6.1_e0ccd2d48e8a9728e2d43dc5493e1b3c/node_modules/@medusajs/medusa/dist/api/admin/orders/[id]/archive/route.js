"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const utils_1 = require("@medusajs/framework/utils");
const POST = async (req, res) => {
    const remoteQuery = req.scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const { id } = req.params;
    await (0, core_flows_1.archiveOrderWorkflow)(req.scope).run({
        input: { orderIds: [id] },
    });
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "order",
        variables: { id },
        fields: req.queryConfig.fields,
    });
    const [order] = await remoteQuery(queryObject);
    res.status(200).json({ order });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map