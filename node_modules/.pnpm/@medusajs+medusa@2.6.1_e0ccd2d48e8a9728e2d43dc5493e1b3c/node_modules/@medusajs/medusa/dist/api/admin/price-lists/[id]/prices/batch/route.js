"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = void 0;
const utils_1 = require("@medusajs/framework/utils");
const queries_1 = require("../../../queries");
const query_config_1 = require("../../../query-config");
const core_flows_1 = require("@medusajs/core-flows");
const POST = async (req, res) => {
    const id = req.params.id;
    const { create = [], update = [], delete: deletePriceIds = [], } = req.validatedBody;
    const workflow = (0, core_flows_1.batchPriceListPricesWorkflow)(req.scope);
    const { result } = await workflow.run({
        input: {
            data: {
                id,
                create,
                update,
                delete: deletePriceIds,
            },
        },
    });
    const [created, updated] = await (0, utils_1.promiseAll)([
        (0, queries_1.listPrices)(result.created.map((c) => c.id), req.scope, query_config_1.adminPriceListPriceRemoteQueryFields),
        (0, queries_1.listPrices)(result.updated.map((c) => c.id), req.scope, query_config_1.adminPriceListPriceRemoteQueryFields),
    ]);
    res.status(200).json({
        created,
        updated,
        deleted: {
            ids: deletePriceIds,
            object: "price",
            deleted: true,
        },
    });
};
exports.POST = POST;
//# sourceMappingURL=route.js.map