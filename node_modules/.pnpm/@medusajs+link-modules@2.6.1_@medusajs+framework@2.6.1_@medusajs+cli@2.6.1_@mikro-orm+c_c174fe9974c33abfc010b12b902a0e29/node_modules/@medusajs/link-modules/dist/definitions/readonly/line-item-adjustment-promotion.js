"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LineItemAdjustmentPromotion = void 0;
const utils_1 = require("@medusajs/framework/utils");
exports.LineItemAdjustmentPromotion = {
    isLink: true,
    isReadOnlyLink: true,
    extends: [
        {
            serviceName: utils_1.Modules.CART,
            entity: "LineItemAdjustment",
            relationship: {
                serviceName: utils_1.Modules.PROMOTION,
                entity: "Promotion",
                primaryKey: "id",
                foreignKey: "promotion_id",
                alias: "promotion",
                args: {
                    methodSuffix: "Promotions",
                },
            },
        },
    ],
};
//# sourceMappingURL=line-item-adjustment-promotion.js.map