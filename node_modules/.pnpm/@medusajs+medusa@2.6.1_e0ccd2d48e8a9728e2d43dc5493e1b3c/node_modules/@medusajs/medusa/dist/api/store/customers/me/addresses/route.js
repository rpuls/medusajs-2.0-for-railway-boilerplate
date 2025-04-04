"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.GET = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const utils_1 = require("@medusajs/framework/utils");
const helpers_1 = require("../../helpers");
const GET = async (req, res) => {
    const customerId = req.auth_context.actor_id;
    const remoteQuery = req.scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "customer_address",
        variables: {
            filters: { ...req.filterableFields, customer_id: customerId },
            ...req.queryConfig.pagination,
        },
        fields: req.queryConfig.fields,
    });
    const { rows: addresses, metadata } = await remoteQuery(queryObject);
    res.json({
        addresses,
        count: metadata.count,
        offset: metadata.skip,
        limit: metadata.take,
    });
};
exports.GET = GET;
const POST = async (req, res) => {
    const customerId = req.auth_context.actor_id;
    const createAddresses = (0, core_flows_1.createCustomerAddressesWorkflow)(req.scope);
    const addresses = [
        {
            ...req.validatedBody,
            customer_id: customerId,
        },
    ];
    await createAddresses.run({
        input: { addresses },
    });
    const customer = await (0, helpers_1.refetchCustomer)(customerId, req.scope, req.queryConfig.fields);
    res.status(200).json({ customer });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map