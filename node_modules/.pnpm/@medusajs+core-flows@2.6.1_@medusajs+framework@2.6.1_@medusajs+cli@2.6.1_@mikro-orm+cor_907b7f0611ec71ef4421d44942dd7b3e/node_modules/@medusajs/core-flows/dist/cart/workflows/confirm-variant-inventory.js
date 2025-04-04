"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmVariantInventoryWorkflow = exports.confirmVariantInventoryWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
const prepare_confirm_inventory_input_1 = require("../utils/prepare-confirm-inventory-input");
exports.confirmVariantInventoryWorkflowId = "confirm-item-inventory";
/**
 * This workflow validates that product variants are in-stock at the specified sales channel, before adding them or updating their quantity in the cart. If a variant doesn't have sufficient quantity in-stock,
 * the workflow throws an error. If all variants have sufficient inventory, the workflow returns the cart's items with their inventory details.
 *
 * This workflow is useful when confirming that a product variant has sufficient quantity to be added to or updated in the cart. It's executed
 * by other cart-related workflows, such as {@link addToCartWorkflow}, to confirm that a product variant can be added to the cart at the specified quantity.
 *
 * :::note
 *
 * Learn more about the links between the product variant and sales channels and inventory items in [this documentation](https://docs.medusajs.com/resources/commerce-modules/product/links-to-other-modules).
 *
 * :::
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you to check whether a product variant has enough inventory quantity before adding them to the cart.
 *
 * @example
 * You can retrieve a variant's required details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query):
 *
 * ```ts workflow={false}
 * const { data: variants } = await query.graph({
 *   entity: "variant",
 *   fields: [
 *     "id",
 *     "manage_inventory",
 *     "inventory_items.inventory_item_id",
 *     "inventory_items.required_quantity",
 *     "inventory_items.inventory.requires_shipping",
 *     "inventory_items.inventory.location_levels.stocked_quantity",
 *     "inventory_items.inventory.location_levels.reserved_quantity",
 *     "inventory_items.inventory.location_levels.raw_stocked_quantity",
 *     "inventory_items.inventory.location_levels.raw_reserved_quantity",
 *     "inventory_items.inventory.location_levels.stock_locations.id",
 *     "inventory_items.inventory.location_levels.stock_locations.name",
 *     "inventory_items.inventory.location_levels.stock_locations.sales_channels.id",
 *     "inventory_items.inventory.location_levels.stock_locations.sales_channels.name",
 *   ],
 *   filters: {
 *     id: ["variant_123"]
 *   }
 * })
 * ```
 *
 * :::note
 *
 * In a workflow, use [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep) instead.
 *
 * :::
 *
 * Then, pass the variant's data with the other required data to the workflow:
 *
 * ```ts
 * const { result } = await confirmVariantInventoryWorkflow(container)
 *   .run({
 *     input: {
 *       sales_channel_id: "sc_123",
 *       // @ts-ignore
 *       variants,
 *       items: [
 *         {
 *           variant_id: "variant_123",
 *           quantity: 1
 *         }
 *       ]
 *     }
 *   })
 * ```
 *
 * When updating an item quantity:
 *
 * ```ts
 * const { result } = await confirmVariantInventoryWorkflow(container)
 *  .run({
 *    input: {
 *      sales_channel_id: "sc_123",
 *      // @ts-ignore
 *      variants,
 *      items: [
 *        {
 *          variant_id: "variant_123",
 *          quantity: 1
 *        }
 *      ],
 *      itemsToUpdate: [
 *        {
 *          data: {
 *            variant_id: "variant_123",
 *            quantity: 2
 *          }
 *        }
 *      ]
 *    }
 *  })
 * ```
 *
 * @summary
 *
 * Validate that a variant is in-stock before adding to the cart.
 */
exports.confirmVariantInventoryWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.confirmVariantInventoryWorkflowId, (input) => {
    const confirmInventoryInput = (0, workflows_sdk_1.transform)({ input }, prepare_confirm_inventory_input_1.prepareConfirmInventoryInput);
    (0, steps_1.confirmInventoryStep)(confirmInventoryInput);
    return new workflows_sdk_1.WorkflowResponse(confirmInventoryInput);
});
//# sourceMappingURL=confirm-variant-inventory.js.map