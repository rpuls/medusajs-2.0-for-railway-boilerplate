"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const utils_1 = require("@medusajs/framework/utils");
const core_flows_1 = require("@medusajs/core-flows");
const helpers_1 = require("./helpers");
const POST = async (req, res) => {
    // If `actor_id` is present, the request carries authentication for an existing customer
    if (req.auth_context.actor_id) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, "Request already authenticated as a customer.");
    }
    const createCustomers = (0, core_flows_1.createCustomerAccountWorkflow)(req.scope);
    const customerData = req.validatedBody;
    const { result } = await createCustomers.run({
        input: { customerData, authIdentityId: req.auth_context.auth_identity_id },
    });
    const customer = await (0, helpers_1.refetchCustomer)(result.id, req.scope, req.queryConfig.fields);
    res.status(200).json({ customer });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map