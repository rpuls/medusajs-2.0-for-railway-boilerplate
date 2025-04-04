"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refetchTaxRate = void 0;
const utils_1 = require("@medusajs/framework/utils");
const refetchTaxRate = async (taxRateId, scope, fields) => {
    const remoteQuery = scope.resolve(utils_1.ContainerRegistrationKeys.REMOTE_QUERY);
    const queryObject = (0, utils_1.remoteQueryObjectFromString)({
        entryPoint: "tax_rate",
        variables: {
            filters: { id: taxRateId },
        },
        fields: fields,
    });
    const taxRates = await remoteQuery(queryObject);
    return taxRates[0];
};
exports.refetchTaxRate = refetchTaxRate;
//# sourceMappingURL=helpers.js.map