"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = exports.POST = exports.GET = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const utils_1 = require("@medusajs/framework/utils");
const helpers_1 = require("../../../helpers");
const GET = async (req, res) => {
    const customerId = req.auth_context.actor_id;
    const remoteQuery = req.scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "customer_address",
        variables: {
            filters: { id: req.params.address_id, customer_id: customerId },
        },
        fields: req.queryConfig.fields,
    });
    const [address] = await remoteQuery(queryObject);
    if (!address) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `Address with id: ${req.params.address_id} was not found`);
    }
    res.status(200).json({ address });
};
exports.GET = GET;
const POST = async (req, res) => {
    const id = req.auth_context.actor_id;
    await validateCustomerAddress(req.scope, id, req.params.address_id);
    const updateAddresses = (0, core_flows_1.updateCustomerAddressesWorkflow)(req.scope);
    await updateAddresses.run({
        input: {
            selector: { id: req.params.address_id, customer_id: req.params.id },
            update: req.validatedBody,
        },
    });
    const customer = await (0, helpers_1.refetchCustomer)(id, req.scope, req.queryConfig.fields);
    res.status(200).json({ customer });
};
exports.POST = POST;
const DELETE = async (req, res) => {
    const id = req.auth_context.actor_id;
    await validateCustomerAddress(req.scope, id, req.params.address_id);
    const deleteAddress = (0, core_flows_1.deleteCustomerAddressesWorkflow)(req.scope);
    await deleteAddress.run({
        input: { ids: [req.params.address_id] },
    });
    const customer = await (0, helpers_1.refetchCustomer)(id, req.scope, req.queryConfig.fields);
    res.status(200).json({
        id,
        object: "address",
        deleted: true,
        parent: customer,
    });
};
exports.DELETE = DELETE;
const validateCustomerAddress = async (scope, customerId, addressId) => {
    const remoteQuery = scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "customer_address",
        variables: {
            filters: { id: addressId, customer_id: customerId },
        },
        fields: ["id"],
    });
    const [address] = await remoteQuery(queryObject);
    if (!address) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `Address with id: ${addressId} was not found`);
    }
};
//# sourceMappingURL=route.js.map