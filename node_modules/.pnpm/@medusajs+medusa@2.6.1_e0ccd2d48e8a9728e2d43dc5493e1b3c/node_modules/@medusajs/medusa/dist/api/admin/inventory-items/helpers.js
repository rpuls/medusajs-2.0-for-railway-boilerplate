"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refetchInventoryItem = void 0;
const utils_1 = require("@medusajs/framework/utils");
const refetchInventoryItem = async (inventoryItemId, scope, fields) => {
    const remoteQuery = scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "inventory_item",
        variables: {
            filters: { id: inventoryItemId },
            skip: 0,
            take: 1,
        },
        fields: fields,
    });
    // TODO: Why does the response type change if you pass skip and take, vs not passing it?
    // Also, why does the data change (in this case, not doing skip and take will not return the lazy fields of stockedQuantity and reserved_quantity)
    const { rows } = await remoteQuery(queryObject);
    return rows[0];
};
exports.refetchInventoryItem = refetchInventoryItem;
//# sourceMappingURL=helpers.js.map