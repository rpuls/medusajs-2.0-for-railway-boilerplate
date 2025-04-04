"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPriceList = getPriceList;
const utils_1 = require("@medusajs/framework/utils");
const _1 = require("./");
async function getPriceList({ id, container, remoteQueryFields, apiFields, }) {
    const remoteQuery = container.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "price_list",
        fields: remoteQueryFields,
        variables: { id },
    });
    const priceLists = await remoteQuery(queryObject);
    const [sanitizedPriceList] = (0, _1.buildPriceListResponse)(priceLists, apiFields);
    if (!(0, utils_1.isPresent)(sanitizedPriceList)) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.NOT_FOUND, `Price list with id: ${id} was not found`);
    }
    return sanitizedPriceList;
}
//# sourceMappingURL=get-price-list.js.map