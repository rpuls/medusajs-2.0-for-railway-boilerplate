"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DELETE = exports.POST = exports.GET = void 0;
const core_flows_1 = require("@medusajs/core-flows");
const utils_1 = require("@medusajs/framework/utils");
const helpers_1 = require("../helpers");
const GET = async (req, res) => {
    const idOrCode = req.params.id;
    const remoteQuery = req.scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "promotion",
        variables: {
            filters: { $or: [{ id: idOrCode }, { code: idOrCode }] },
        },
        fields: req.queryConfig.fields,
    });
    const [promotion] = await remoteQuery(queryObject);
    if (!promotion) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `Promotion with id or code: ${idOrCode} was not found`);
    }
    res.status(200).json({ promotion });
};
exports.GET = GET;
const POST = async (req, res) => {
    const { additional_data, ...rest } = req.validatedBody;
    const updatePromotions = (0, core_flows_1.updatePromotionsWorkflow)(req.scope);
    const promotionsData = [
        {
            id: req.params.id,
            ...rest,
        },
    ];
    await updatePromotions.run({
        input: { promotionsData, additional_data },
    });
    const promotion = await (0, helpers_1.refetchPromotion)(req.params.id, req.scope, req.queryConfig.fields);
    res.status(200).json({ promotion });
};
exports.POST = POST;
const DELETE = async (req, res) => {
    const id = req.params.id;
    const deletePromotions = (0, core_flows_1.deletePromotionsWorkflow)(req.scope);
    await deletePromotions.run({
        input: { ids: [id] },
    });
    res.status(200).json({
        id,
        object: "promotion",
        deleted: true,
    });
};
exports.DELETE = DELETE;
//# sourceMappingURL=route.js.map