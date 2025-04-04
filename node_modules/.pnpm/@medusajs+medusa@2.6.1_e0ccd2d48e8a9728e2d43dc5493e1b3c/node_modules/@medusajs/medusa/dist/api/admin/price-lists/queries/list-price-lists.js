"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPriceLists = listPriceLists;
const utils_1 = require("@medusajs/framework/utils");
async function listPriceLists({ container, remoteQueryFields, variables, }) {
    const remoteQuery = container.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "price_list",
        fields: remoteQueryFields,
        variables,
    });
    const { rows: priceLists, metadata } = await remoteQuery(queryObject);
    return [priceLists, metadata.count];
}
//# sourceMappingURL=list-price-lists.js.map