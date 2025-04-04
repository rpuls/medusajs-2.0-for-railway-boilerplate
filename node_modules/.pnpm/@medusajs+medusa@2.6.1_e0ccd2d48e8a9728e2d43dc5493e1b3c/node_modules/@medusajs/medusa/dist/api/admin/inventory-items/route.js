"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = exports.POST = void 0;
const utils_1 = require("@medusajs/framework/utils");
const core_flows_1 = require("@medusajs/core-flows");
const helpers_1 = require("./helpers");
const POST = async (req, res) => {
    const { result } = await (0, core_flows_1.createInventoryItemsWorkflow)(req.scope).run({
        input: { items: [req.validatedBody] },
    });
    const inventoryItem = await (0, helpers_1.refetchInventoryItem)(result[0].id, req.scope, req.queryConfig.fields);
    res.status(200).json({ inventory_item: inventoryItem });
};
exports.POST = POST;
const GET = async (req, res) => {
    const remoteQuery = req.scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const query = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "inventory_items",
        variables: {
            filters: req.filterableFields,
            ...req.queryConfig.pagination,
        },
        fields: req.queryConfig.fields,
    });
    const { rows: inventory_items, metadata } = await remoteQuery({
        ...query,
    });
    res.status(200).json({
        inventory_items,
        count: metadata.count,
        offset: metadata.skip,
        limit: metadata.take,
    });
};
exports.GET = GET;
//# sourceMappingURL=route.js.map