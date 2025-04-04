"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = exports.POST = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const http_1 = require("@medusajs/framework/http");
const utils_1 = require("@medusajs/framework/utils");
const query_config_1 = require("../../../../../returns/query-config");
const POST = async (req, res) => {
    const { id, action_id } = req.params;
    const remoteQuery = req.scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const [claim] = await remoteQuery((0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "order_claim",
        variables: {
            id,
        },
        fields: ["id", "return_id"],
    }), {
        throwIfKeyNotFound: true,
    });
    const { result } = await (0, core_flows_1.updateRequestItemReturnWorkflow)(req.scope).run({
        input: {
            data: { ...req.validatedBody },
            return_id: claim.return_id,
            claim_id: claim.id,
            action_id,
        },
    });
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "return",
        variables: {
            id: claim.return_id,
        },
        fields: query_config_1.defaultAdminDetailsReturnFields,
    });
    const [orderReturn] = await remoteQuery(queryObject);
    res.json({
        order_preview: result,
        return: orderReturn,
    });
};
exports.POST = POST;
const DELETE = async (req, res) => {
    const { id, action_id } = req.params;
    const claim = await (0, http_1.refetchEntity)("order_claim", id, req.scope, [
        "id",
        "return_id",
    ]);
    const { result: orderPreview } = await (0, core_flows_1.removeItemReturnActionWorkflow)(req.scope).run({
        input: {
            return_id: claim.return_id,
            action_id,
        },
    });
    const orderReturn = await (0, http_1.refetchEntity)("return", {
        ...req.filterableFields,
        id,
    }, req.scope, query_config_1.defaultAdminDetailsReturnFields);
    res.json({
        order_preview: orderPreview,
        return: orderReturn,
    });
};
exports.DELETE = DELETE;
//# sourceMappingURL=route.js.map