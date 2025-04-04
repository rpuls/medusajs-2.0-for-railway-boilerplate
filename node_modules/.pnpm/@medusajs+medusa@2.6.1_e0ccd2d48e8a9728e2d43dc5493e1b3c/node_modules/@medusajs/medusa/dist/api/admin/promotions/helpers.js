"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refetchBatchRules = exports.refetchPromotion = void 0;
const utils_1 = require("@medusajs/framework/utils");
const refetchPromotion = async (promotionId, scope, fields) => {
    const remoteQuery = scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "promotion",
        variables: {
            filters: { id: promotionId },
        },
        fields: fields,
    });
    const promotions = await remoteQuery(queryObject);
    return promotions[0];
};
exports.refetchPromotion = refetchPromotion;
const refetchBatchRules = async (batchResult, scope, fields) => {
    const remoteQuery = scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    let created = Promise.resolve([]);
    let updated = Promise.resolve([]);
    if (batchResult.created.length) {
        const createdQuery = (0, utils_1.remoteQueryObjectFromString)({
            entryPoint: "promotion_rule",
            variables: {
                filters: { id: batchResult.created.map((p) => p.id) },
            },
            fields: fields,
        });
        created = remoteQuery(createdQuery);
    }
    if (batchResult.updated.length) {
        const updatedQuery = (0, utils_1.remoteQueryObjectFromString)({
            entryPoint: "promotion_rule",
            variables: {
                filters: { id: batchResult.updated.map((p) => p.id) },
            },
            fields: fields,
        });
        updated = remoteQuery(updatedQuery);
    }
    const [createdRes, updatedRes] = await (0, utils_1.promiseAll)([created, updated]);
    return {
        created: createdRes,
        updated: updatedRes,
        deleted: {
            ids: batchResult.deleted,
            object: "promotion-rule",
            deleted: true,
        },
    };
};
exports.refetchBatchRules = refetchBatchRules;
//# sourceMappingURL=helpers.js.map