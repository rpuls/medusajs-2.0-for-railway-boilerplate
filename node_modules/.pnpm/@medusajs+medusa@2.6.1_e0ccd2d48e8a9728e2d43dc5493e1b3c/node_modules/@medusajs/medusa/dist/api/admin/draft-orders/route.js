"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = exports.GET = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const utils_1 = require("@medusajs/framework/utils");
const helpers_1 = require("./helpers");
const GET = async (req, res) => {
    const variables = {
        filters: {
            ...req.filterableFields,
            is_draft_order: true,
        },
        ...req.queryConfig.pagination,
    };
    const workflow = (0, core_flows_1.getOrdersListWorkflow)(req.scope);
    const { result } = await workflow.run({
        input: {
            fields: req.queryConfig.fields,
            variables,
        },
    });
    const { rows, metadata } = result;
    res.json({
        draft_orders: rows,
        count: metadata.count,
        offset: metadata.skip,
        limit: metadata.take,
    });
};
exports.GET = GET;
const POST = async (req, res) => {
    const input = req.validatedBody;
    const workflowInput = {
        ...input,
        no_notification: !!input.no_notification_order,
        status: utils_1.OrderStatus.DRAFT,
        is_draft_order: true,
    };
    const remoteQuery = req.scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    /**
     * If the currency code is not provided, we fetch the region and use the currency code from there.
     */
    if (!workflowInput.currency_code) {
        const queryObject = (0, utils_1.remoteQueryObjectFromString)({
            entryPoint: "region",
            variables: {
                filters: { id: input.region_id },
            },
            fields: ["currency_code"],
        });
        const [region] = await remoteQuery(queryObject);
        workflowInput.currency_code = region?.currency_code;
    }
    /**
     * If the email is not provided, we fetch the customer and use the email from there.
     */
    if (!workflowInput.email) {
        const queryObject = (0, utils_1.remoteQueryObjectFromString)({
            entryPoint: "customer",
            variables: {
                filters: { id: input.customer_id },
            },
            fields: ["email"],
        });
        const [customer] = await remoteQuery(queryObject);
        workflowInput.email = customer?.email;
    }
    /**
     * We accept either a ID or a payload for both billing and shipping addresses.
     * If either field was received as a string, we assume it's an ID and
     * then ensure that it is passed along correctly to the workflow.
     */
    if (typeof input.billing_address === "string") {
        workflowInput.billing_address_id = input.billing_address;
        delete workflowInput.billing_address;
    }
    if (typeof input.shipping_address === "string") {
        workflowInput.shipping_address_id = input.shipping_address;
        delete workflowInput.shipping_address;
    }
    const { result } = await (0, core_flows_1.createOrderWorkflow)(req.scope).run({
        input: workflowInput,
    });
    const draftOrder = await (0, helpers_1.refetchOrder)(result.id, req.scope, req.queryConfig.fields);
    res.status(200).json({ draft_order: draftOrder });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map