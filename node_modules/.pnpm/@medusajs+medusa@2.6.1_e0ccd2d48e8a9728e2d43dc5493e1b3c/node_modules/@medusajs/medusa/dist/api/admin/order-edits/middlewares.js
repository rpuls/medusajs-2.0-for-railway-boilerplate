"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminOrderEditRoutesMiddlewares = void 0;
const framework_1 = require("@medusajs/framework");
const validators_1 = require("./validators");
exports.adminOrderEditRoutesMiddlewares = [
    {
        method: ["GET"],
        matcher: "/admin/order-edits/:id",
        middlewares: [],
    },
    {
        method: ["POST"],
        matcher: "/admin/order-edits",
        middlewares: [(0, framework_1.validateAndTransformBody)(validators_1.AdminPostOrderEditsReqSchema)],
    },
    {
        method: ["POST"],
        matcher: "/admin/order-edits/:id/items",
        middlewares: [
            (0, framework_1.validateAndTransformBody)(validators_1.AdminPostOrderEditsAddItemsReqSchema),
        ],
    },
    {
        method: ["POST"],
        matcher: "/admin/order-edits/:id/items/:action_id",
        middlewares: [
            (0, framework_1.validateAndTransformBody)(validators_1.AdminPostOrderEditsItemsActionReqSchema),
        ],
    },
    {
        method: ["POST"],
        matcher: "/admin/order-edits/:id/items/item/:item_id",
        middlewares: [
            (0, framework_1.validateAndTransformBody)(validators_1.AdminPostOrderEditsUpdateItemQuantityReqSchema),
        ],
    },
    {
        method: ["DELETE"],
        matcher: "/admin/order-edits/:id/items/:action_id",
        middlewares: [],
    },
    {
        method: ["POST"],
        matcher: "/admin/order-edits/:id/shipping-method",
        middlewares: [
            (0, framework_1.validateAndTransformBody)(validators_1.AdminPostOrderEditsShippingReqSchema),
        ],
    },
    {
        method: ["POST"],
        matcher: "/admin/order-edits/:id/shipping-method/:action_id",
        middlewares: [
            (0, framework_1.validateAndTransformBody)(validators_1.AdminPostOrderEditsShippingActionReqSchema),
        ],
    },
    {
        method: ["DELETE"],
        matcher: "/admin/order-edits/:id/shipping-method/:action_id",
        middlewares: [],
    },
    {
        method: ["POST"],
        matcher: "/admin/order-edits/:id/confirm",
        middlewares: [],
    },
    {
        method: ["POST"],
        matcher: "/admin/order-edits/:id/request",
        middlewares: [],
    },
    {
        method: ["DELETE"],
        matcher: "/admin/order-edits/:id",
        middlewares: [],
    },
];
//# sourceMappingURL=middlewares.js.map