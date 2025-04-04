"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = void 0;
const utils_1 = require("@medusajs/framework/utils");
const GET = async (req, res) => {
    const fulfillmentProviderService = req.scope.resolve(utils_1.Modules.FULFILLMENT);
    const fulfillmentOptions = await fulfillmentProviderService.retrieveFulfillmentOptions(req.params.id);
    res.json({
        fulfillment_options: fulfillmentOptions,
        count: fulfillmentOptions.length,
        limit: fulfillmentOptions.length,
        offset: 0,
    });
};
exports.GET = GET;
//# sourceMappingURL=route.js.map