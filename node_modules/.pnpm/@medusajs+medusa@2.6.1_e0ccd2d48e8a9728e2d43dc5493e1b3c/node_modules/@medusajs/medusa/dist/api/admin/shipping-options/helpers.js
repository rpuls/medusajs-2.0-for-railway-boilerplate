"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refetchBatchRules = exports.refetchShippingOption = void 0;
const utils_1 = require("@medusajs/framework/utils");
const refetchShippingOption = async (shippingOptionId, scope, fields) => {
    const query = scope.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const { data } = await query.graph({
        entity: "shipping_option",
        filters: { id: shippingOptionId },
        fields: fields,
    });
    return data[0];
};
exports.refetchShippingOption = refetchShippingOption;
const refetchBatchRules = async (batchResult, scope, fields) => {
    const query = scope.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    let created = Promise.resolve([]);
    let updated = Promise.resolve([]);
    if (batchResult.created.length) {
        created = query
            .graph({
            entity: "shipping_option_rule",
            filters: { id: batchResult.created.map((p) => p.id) },
            fields: fields,
        })
            .then(({ data }) => data);
    }
    if (batchResult.updated.length) {
        updated = query
            .graph({
            entity: "shipping_option_rule",
            filters: { id: batchResult.updated.map((p) => p.id) },
            fields: fields,
        })
            .then(({ data }) => data);
    }
    const [createdRes, updatedRes] = await (0, utils_1.promiseAll)([created, updated]);
    return {
        created: createdRes,
        updated: updatedRes,
        deleted: {
            ids: batchResult.deleted,
            object: "shipping_option_rule",
            deleted: true,
        },
    };
};
exports.refetchBatchRules = refetchBatchRules;
//# sourceMappingURL=helpers.js.map