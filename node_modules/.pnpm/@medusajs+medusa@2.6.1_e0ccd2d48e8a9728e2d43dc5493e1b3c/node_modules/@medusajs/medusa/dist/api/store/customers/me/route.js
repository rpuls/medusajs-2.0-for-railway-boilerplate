"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.GET = void 0;
const helpers_1 = require("../helpers");
const utils_1 = require("@medusajs/framework/utils");
const core_flows_1 = require("@medusajs/core-flows");
const GET = async (req, res) => {
    const id = req.auth_context.actor_id;
    const customer = await (0, helpers_1.refetchCustomer)(id, req.scope, req.queryConfig.fields);
    if (!customer) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `Customer with id: ${id} was not found`);
    }
    res.json({ customer });
};
exports.GET = GET;
const POST = async (req, res) => {
    const customerId = req.auth_context.actor_id;
    await (0, core_flows_1.updateCustomersWorkflow)(req.scope).run({
        input: {
            selector: { id: customerId },
            update: req.validatedBody,
        },
    });
    const customer = await (0, helpers_1.refetchCustomer)(customerId, req.scope, req.queryConfig.fields);
    res.status(200).json({ customer });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map