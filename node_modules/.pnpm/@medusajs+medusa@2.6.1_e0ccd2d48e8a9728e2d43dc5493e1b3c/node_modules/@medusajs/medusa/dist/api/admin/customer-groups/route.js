"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.GET = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const utils_1 = require("@medusajs/framework/utils");
const helpers_1 = require("./helpers");
const GET = async (req, res) => {
    const remoteQuery = req.scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const query = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "customer_group",
        variables: {
            filters: req.filterableFields,
            ...req.queryConfig.pagination,
        },
        fields: req.queryConfig.fields,
    });
    const { rows: customer_groups, metadata } = await remoteQuery(query);
    res.json({
        customer_groups,
        count: metadata.count,
        offset: metadata.skip,
        limit: metadata.take,
    });
};
exports.GET = GET;
const POST = async (req, res) => {
    const createGroups = (0, core_flows_1.createCustomerGroupsWorkflow)(req.scope);
    const customersData = [
        {
            ...req.validatedBody,
            created_by: req.auth_context.actor_id,
        },
    ];
    const { result } = await createGroups.run({
        input: { customersData },
    });
    const customerGroup = await (0, helpers_1.refetchCustomerGroup)(result[0].id, req.scope, req.queryConfig.fields);
    res.status(200).json({ customer_group: customerGroup });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map