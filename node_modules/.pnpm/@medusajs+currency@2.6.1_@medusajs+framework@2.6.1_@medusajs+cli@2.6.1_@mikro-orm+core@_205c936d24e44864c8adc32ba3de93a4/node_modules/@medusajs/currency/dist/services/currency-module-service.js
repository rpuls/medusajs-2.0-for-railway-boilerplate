"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const _models_1 = require("../models");
class CurrencyModuleService extends (0, utils_1.MedusaService)({ Currency: _models_1.Currency }) {
    constructor({ baseRepository, currencyService }, moduleDeclaration) {
        // @ts-ignore
        super(...arguments);
        this.moduleDeclaration = moduleDeclaration;
        this.baseRepository_ = baseRepository;
        this.currencyService_ = currencyService;
    }
    // @ts-expect-error
    async retrieveCurrency(code, config, sharedContext) {
        return await super.retrieveCurrency(CurrencyModuleService.normalizeFilters({ code: [code] }).code[0], config, sharedContext);
    }
    // @ts-expect-error
    async listCurrencies(filters, config, sharedContext) {
        return await super.listCurrencies(CurrencyModuleService.normalizeFilters(filters), config, sharedContext);
    }
    // @ts-expect-error
    async listAndCountCurrencies(filters, config, sharedContext) {
        return await super.listAndCountCurrencies(CurrencyModuleService.normalizeFilters(filters), config, sharedContext);
    }
    static normalizeFilters(filters) {
        return normalizeFilterable(filters, (fieldName, value) => {
            if (fieldName === "code" && !!value) {
                return value.toLowerCase();
            }
            return value;
        });
    }
}
exports.default = CurrencyModuleService;
// TODO: Move normalizer support to `buildQuery` so we don't even need to override the list/retrieve methods just for normalization
const normalizeFilterable = (filters, normalizer) => {
    if (!filters) {
        return filters;
    }
    const normalizedFilters = {};
    for (const key in filters) {
        if (key === "$and" || key === "$or") {
            normalizedFilters[key] = filters[key].map((filter) => normalizeFilterable(filter, normalizer));
        }
        else if (filters[key] !== undefined) {
            if (Array.isArray(filters[key])) {
                normalizedFilters[key] = filters[key].map((val) => normalizer(key, val));
            }
            else {
                normalizedFilters[key] = normalizer(key, filters[key]);
            }
        }
    }
    return normalizedFilters;
};
//# sourceMappingURL=currency-module-service.js.map