"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = exports.POST = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const utils_1 = require("@medusajs/framework/utils");
const POST = async (req, res) => {
    const remoteQuery = req.scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const orderModuleService = req.scope.resolve(utils_1.Modules.ORDER);
    const { id } = req.params;
    const workflow = (0, core_flows_1.beginReceiveReturnWorkflow)(req.scope);
    const { result } = await workflow.run({
        input: {
            ...req.validatedBody,
            return_id: id,
        },
    });
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "return",
        variables: {
            id: result.return_id,
            filters: {
                ...req.filterableFields,
            },
        },
        fields: req.queryConfig.fields,
    });
    const [order, orderReturn] = await (0, utils_1.promiseAll)([
        orderModuleService.retrieveOrder(result.order_id),
        remoteQuery(queryObject),
    ]);
    res.json({
        order,
        return: orderReturn[0],
    });
};
exports.POST = POST;
const DELETE = async (req, res) => {
    const { id } = req.params;
    await (0, core_flows_1.cancelReturnReceiveWorkflow)(req.scope).run({
        input: {
            return_id: id,
        },
    });
    res.status(200).json({
        id,
        object: "return",
        deleted: true,
    });
};
exports.DELETE = DELETE;
//# sourceMappingURL=route.js.map