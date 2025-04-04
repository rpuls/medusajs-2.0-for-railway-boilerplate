"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = exports.POST = exports.GET = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const utils_1 = require("@medusajs/framework/utils");
const helpers_1 = require("../../../helpers");
const GET = async (req, res) => {
    const remoteQuery = req.scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "customer_address",
        variables: {
            filters: { id: req.params.address_id, customer_id: req.params.id },
        },
        fields: req.queryConfig.fields,
    });
    const [address] = await remoteQuery(queryObject);
    res.status(200).json({ address });
};
exports.GET = GET;
const POST = async (req, res) => {
    const { additional_data, ...rest } = req.validatedBody;
    const updateAddresses = (0, core_flows_1.updateCustomerAddressesWorkflow)(req.scope);
    await updateAddresses.run({
        input: {
            selector: { id: req.params.address_id, customer_id: req.params.id },
            update: rest,
            additional_data,
        },
    });
    const customer = await (0, helpers_1.refetchCustomer)(req.params.id, req.scope, req.queryConfig.fields);
    res.status(200).json({ customer });
};
exports.POST = POST;
const DELETE = async (req, res) => {
    const id = req.params.address_id;
    const deleteAddress = (0, core_flows_1.deleteCustomerAddressesWorkflow)(req.scope);
    await deleteAddress.run({
        input: { ids: [id] },
    });
    const customer = await (0, helpers_1.refetchCustomer)(req.params.id, req.scope, req.queryConfig.fields);
    res.status(200).json({
        id,
        object: "customer_address",
        deleted: true,
        parent: customer,
    });
};
exports.DELETE = DELETE;
//# sourceMappingURL=route.js.map