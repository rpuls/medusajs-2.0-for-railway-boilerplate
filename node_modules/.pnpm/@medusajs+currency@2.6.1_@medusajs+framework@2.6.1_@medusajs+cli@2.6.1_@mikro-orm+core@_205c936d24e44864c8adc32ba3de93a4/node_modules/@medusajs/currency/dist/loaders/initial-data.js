"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
exports.default = async ({ container, options, }) => {
    // TODO: Add default logger to the container when running tests
    const logger = container.resolve(utils_1.ContainerRegistrationKeys.LOGGER) ?? console;
    const { currencyService_ } = container.resolve("currencyModuleService");
    try {
        const normalizedCurrencies = Object.values(utils_1.defaultCurrencies).map((c) => ({
            ...c,
            code: c.code.toLowerCase(),
        }));
        const resp = await currencyService_.upsert(normalizedCurrencies);
        logger.debug(`Loaded ${resp.length} currencies`);
    }
    catch (error) {
        logger.warn(`Failed to load currencies, skipping loader. Original error: ${error.message}`);
    }
};
//# sourceMappingURL=initial-data.js.map