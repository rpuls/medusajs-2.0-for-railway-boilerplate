"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchPriceListPriceIdsForProduct = exports.transformPriceList = exports.fetchPriceList = void 0;
const utils_1 = require("@medusajs/framework/utils");
const fetchPriceList = async (id, scope, fields) => {
    const remoteQuery = scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "price_lists",
        variables: {
            filters: { id },
        },
        fields,
    });
    const [priceList] = await remoteQuery(queryObject);
    if (!(0, utils_1.isPresent)(priceList)) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `Price list with id: ${id} was not found`);
    }
    return (0, exports.transformPriceList)(priceList);
};
exports.fetchPriceList = fetchPriceList;
const transformPriceList = (priceList) => {
    priceList.rules = (0, utils_1.buildPriceListRules)(priceList.price_list_rules);
    priceList.prices = (0, utils_1.buildPriceSetPricesForCore)(priceList.prices);
    delete priceList.price_list_rules;
    return priceList;
};
exports.transformPriceList = transformPriceList;
const fetchPriceListPriceIdsForProduct = async (priceListId, productIds, scope) => {
    const remoteQuery = scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const priceSetIds = [];
    const variants = await remoteQuery((0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "variants",
        variables: { filters: { product_id: productIds } },
        fields: ["price_set.id"],
    }));
    for (const variant of variants) {
        if (variant.price_set?.id) {
            priceSetIds.push(variant.price_set.id);
        }
    }
    const productPrices = await remoteQuery((0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "prices",
        variables: {
            filters: { price_set_id: priceSetIds, price_list_id: priceListId },
        },
        fields: ["id"],
    }));
    return productPrices.map((price) => price.id);
};
exports.fetchPriceListPriceIdsForProduct = fetchPriceListPriceIdsForProduct;
//# sourceMappingURL=helpers.js.map