"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
exports.default = async ({ container }) => {
    // TODO: Add default logger to the container when running tests
    const logger = container.resolve(utils_1.ContainerRegistrationKeys.LOGGER) ?? console;
    const countryService_ = container.resolve("countryService");
    try {
        const normalizedCountries = utils_1.DefaultsUtils.defaultCountries.map((c) => ({
            iso_2: c.alpha2.toLowerCase(),
            iso_3: c.alpha3.toLowerCase(),
            num_code: c.numeric,
            name: c.name.toUpperCase(),
            display_name: c.name,
        }));
        const resp = await countryService_.upsert(normalizedCountries);
        logger.debug(`Loaded ${resp.length} countries`);
    }
    catch (error) {
        logger.warn(`Failed to load countries, skipping loader. Original error: ${error.message}`);
    }
};
//# sourceMappingURL=defaults.js.map