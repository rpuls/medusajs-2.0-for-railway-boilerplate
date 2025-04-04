"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setTaxContext = setTaxContext;
const http_1 = require("@medusajs/framework/http");
const utils_1 = require("@medusajs/framework/utils");
function setTaxContext() {
    return async (req, _, next) => {
        const withCalculatedPrice = req.queryConfig.fields.some((field) => field.startsWith("variants.calculated_price"));
        if (!withCalculatedPrice) {
            return next();
        }
        try {
            const inclusivity = await getTaxInclusivityInfo(req);
            if (!inclusivity || !inclusivity.automaticTaxes) {
                return next();
            }
            const taxLinesContext = await getTaxLinesContext(req);
            req.taxContext = {
                taxLineContext: taxLinesContext,
                taxInclusivityContext: inclusivity,
            };
            return next();
        }
        catch (e) {
            next(e);
        }
    };
}
const getTaxInclusivityInfo = async (req) => {
    const region = await (0, http_1.refetchEntity)("region", req.filterableFields.region_id, req.scope, ["automatic_taxes"]);
    if (!region) {
        throw new utils_1.MedusaError(utils_1.MedusaError.Types.INVALID_DATA, `Region with id ${req.filterableFields.region_id} not found when populating the tax context`);
    }
    return {
        automaticTaxes: region.automatic_taxes,
    };
};
const getTaxLinesContext = async (req) => {
    if (!req.filterableFields.country_code) {
        return;
    }
    const taxContext = {
        address: {
            country_code: req.filterableFields.country_code,
            province_code: req.filterableFields.province,
        },
    };
    return taxContext;
};
//# sourceMappingURL=set-tax-context.js.map