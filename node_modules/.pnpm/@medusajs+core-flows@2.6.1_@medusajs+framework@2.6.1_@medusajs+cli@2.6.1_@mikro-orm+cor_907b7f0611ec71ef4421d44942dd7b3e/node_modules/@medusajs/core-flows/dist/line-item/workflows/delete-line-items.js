"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLineItemsWorkflow = exports.deleteLineItemsWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const refresh_cart_items_1 = require("../../cart/workflows/refresh-cart-items");
const delete_line_items_1 = require("../steps/delete-line-items");
exports.deleteLineItemsWorkflowId = "delete-line-items";
/**
 * This workflow deletes line items from a cart. It's used by the
 * [Delete Line Item Store API Route](https://docs.medusajs.com/api/store#carts_deletecartsidlineitemsline_id).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * delete line items from a cart within your custom flows.
 *
 * @example
 * const { result } = await deleteLineItemsWorkflow(container)
 * .run({
 *   input: {
 *     cart_id: "cart_123",
 *     ids: ["li_123"]
 *   }
 * })
 *
 * @summary
 *
 * Delete line items from a cart.
 */
exports.deleteLineItemsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.deleteLineItemsWorkflowId, (input) => {
    (0, delete_line_items_1.deleteLineItemsStep)(input.ids);
    refresh_cart_items_1.refreshCartItemsWorkflow.runAsStep({
        input: { cart_id: input.cart_id },
    });
});
//# sourceMappingURL=delete-line-items.js.map