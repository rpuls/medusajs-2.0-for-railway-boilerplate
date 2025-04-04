"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = exports.POST = exports.GET = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const utils_1 = require("@medusajs/framework/utils");
const helpers_1 = require("../helpers");
const GET = async (req, res) => {
    const customer = await (0, helpers_1.refetchCustomer)(req.params.id, req.scope, req.queryConfig.fields);
    if (!customer) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `Customer with id: ${req.params.id} not found`);
    }
    res.status(200).json({ customer });
};
exports.GET = GET;
const POST = async (req, res) => {
    const existingCustomer = await (0, helpers_1.refetchCustomer)(req.params.id, req.scope, [
        "id",
    ]);
    if (!existingCustomer) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `Customer with id "${req.params.id}" not found`);
    }
    const { additional_data, ...rest } = req.validatedBody;
    await (0, core_flows_1.updateCustomersWorkflow)(req.scope).run({
        input: {
            selector: { id: req.params.id },
            update: rest,
            additional_data,
        },
    });
    const customer = await (0, helpers_1.refetchCustomer)(req.params.id, req.scope, req.queryConfig.fields);
    res.status(200).json({ customer });
};
exports.POST = POST;
const DELETE = async (req, res) => {
    const id = req.params.id;
    await (0, core_flows_1.removeCustomerAccountWorkflow)(req.scope).run({
        input: {
            customerId: id,
        },
    });
    res.status(200).json({
        id,
        object: "customer",
        deleted: true,
    });
};
exports.DELETE = DELETE;
//# sourceMappingURL=route.js.map