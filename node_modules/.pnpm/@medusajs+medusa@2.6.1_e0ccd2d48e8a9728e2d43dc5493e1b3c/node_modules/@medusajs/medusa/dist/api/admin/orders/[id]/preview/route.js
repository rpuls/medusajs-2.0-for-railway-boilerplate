"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = void 0;
const utils_1 = require("@medusajs/framework/utils");
const GET = async (req, res) => {
    const { id } = req.params;
    // NOTE: Consider replacing with remoteQuery when possible
    const orderModuleService = req.scope.resolve(utils_1.Modules.ORDER);
    const order = (await orderModuleService.previewOrderChange(id));
    res.status(200).json({ order });
};
exports.GET = GET;
//# sourceMappingURL=route.js.map