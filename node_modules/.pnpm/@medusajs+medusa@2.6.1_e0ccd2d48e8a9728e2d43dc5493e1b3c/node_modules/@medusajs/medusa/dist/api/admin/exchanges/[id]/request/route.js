"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = exports.POST = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const utils_1 = require("@medusajs/framework/utils");
const query_config_1 = require("../../../returns/query-config");
const POST = async (req, res) => {
    const { id } = req.params;
    const remoteQuery = req.scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const { result } = await (0, core_flows_1.confirmExchangeRequestWorkflow)(req.scope).run({
        input: {
            exchange_id: id,
            confirmed_by: req.auth_context.actor_id,
        },
    });
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "order_exchange",
        variables: {
            id,
            filters: {
                ...req.filterableFields,
            },
        },
        fields: req.queryConfig.fields,
    });
    const [orderExchange] = await remoteQuery(queryObject, {
        throwIfKeyNotFound: true,
    });
    let orderReturn;
    if (orderExchange.return_id) {
        const [orderReturnData] = await remoteQuery((0, utils_1.remoteQueryObjectFromString)({
            entryPoint: "return",
            variables: {
                id: orderExchange.return_id,
            },
            fields: query_config_1.defaultAdminDetailsReturnFields,
        }));
        orderReturn = orderReturnData;
    }
    res.json({
        order_preview: result,
        exchange: orderExchange,
        return: orderReturn,
    });
};
exports.POST = POST;
const DELETE = async (req, res) => {
    const { id } = req.params;
    await (0, core_flows_1.cancelBeginOrderExchangeWorkflow)(req.scope).run({
        input: {
            exchange_id: id,
        },
    });
    res.status(200).json({
        id,
        object: "exchange",
        deleted: true,
    });
};
exports.DELETE = DELETE;
//# sourceMappingURL=route.js.map