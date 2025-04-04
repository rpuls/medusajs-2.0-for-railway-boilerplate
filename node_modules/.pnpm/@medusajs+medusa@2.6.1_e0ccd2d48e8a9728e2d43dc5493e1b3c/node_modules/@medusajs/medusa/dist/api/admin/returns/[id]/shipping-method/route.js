"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const utils_1 = require("@medusajs/framework/utils");
const POST = async (req, res) => {
    const { id } = req.params;
    const remoteQuery = req.scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const { result } = await (0, core_flows_1.createReturnShippingMethodWorkflow)(req.scope).run({
        input: { ...req.validatedBody, return_id: id },
    });
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "return",
        variables: {
            id,
            filters: {
                ...req.filterableFields,
            },
        },
        fields: req.queryConfig.fields,
    });
    const [orderReturn] = await remoteQuery(queryObject);
    res.json({
        order_preview: result,
        return: orderReturn,
    });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map