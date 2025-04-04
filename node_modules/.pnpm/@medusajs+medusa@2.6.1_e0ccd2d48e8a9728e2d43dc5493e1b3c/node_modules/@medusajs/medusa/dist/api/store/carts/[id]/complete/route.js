"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const framework_1 = require("@medusajs/framework");
const utils_1 = require("@medusajs/framework/utils");
const helpers_1 = require("../../helpers");
const query_config_1 = require("../../query-config");
const POST = async (req, res) => {
    const cart_id = req.params.id;
    const { errors, result } = await (0, core_flows_1.completeCartWorkflow)(req.scope).run({
        input: { id: cart_id },
        context: { transactionId: cart_id },
        throwOnError: false,
    });
    const query = req.scope.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    // When an error occurs on the workflow, its potentially got to with cart validations, payments
    // or inventory checks. Return the cart here along with errors for the consumer to take more action
    // and fix them
    if (errors?.[0]) {
        const error = errors[0].error;
        const statusOKErrors = [
            // TODO: add inventory specific errors
            utils_1.MedusaError.Types.PAYMENT_AUTHORIZATION_ERROR,
            utils_1.MedusaError.Types.PAYMENT_REQUIRES_MORE_ERROR,
        ];
        // If we end up with errors outside of statusOKErrors, it means that the cart is not in a state to be
        // completed. In these cases, we return a 400.
        const cart = await (0, helpers_1.refetchCart)(cart_id, req.scope, (0, framework_1.prepareRetrieveQuery)({}, {
            defaults: query_config_1.defaultStoreCartFields,
        }).remoteQueryConfig.fields);
        if (!statusOKErrors.includes(error.type)) {
            throw error;
        }
        res.status(200).json({
            type: "cart",
            cart,
            error: {
                message: error.message,
                name: error.name,
                type: error.type,
            },
        });
        return;
    }
    const { data } = await query.graph({
        entity: "order",
        fields: req.queryConfig.fields,
        filters: { id: result.id },
    });
    res.status(200).json({
        type: "order",
        order: data[0],
    });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map