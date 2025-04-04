"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductOptionsWorkflow = exports.updateProductOptionsWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const emit_event_1 = require("../../common/steps/emit-event");
const steps_1 = require("../steps");
exports.updateProductOptionsWorkflowId = "update-product-options";
/**
 * This workflow updates one or more product options. It's used by the [Update Product Option Admin API Route](https://docs.medusajs.com/api/admin#products_postproductsidvariantsvariant_id).
 *
 * This workflow has a hook that allows you to perform custom actions on the updated product options. For example, you can pass under `additional_data` custom data that
 * allows you to update custom data models linked to the product options.
 *
 * You can also use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around product-option update.
 *
 * @example
 * const { result } = await updateProductOptionsWorkflow(container)
 * .run({
 *   input: {
 *     selector: {
 *       title: "Color"
 *     },
 *     update: {
 *       values: ["Red", "Blue", "Green"]
 *     },
 *     additional_data: {
 *       erp_id: "123"
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Update one or more product options.
 *
 * @property hooks.productOptionsUpdated - This hook is executed after the product options are updated. You can consume this hook to perform custom actions on the updated product options.
 */
exports.updateProductOptionsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.updateProductOptionsWorkflowId, (input) => {
    const updatedProductOptions = (0, steps_1.updateProductOptionsStep)(input);
    const productOptionsUpdated = (0, workflows_sdk_1.createHook)("productOptionsUpdated", {
        product_options: updatedProductOptions,
        additional_data: input.additional_data,
    });
    const optionIdEvents = (0, workflows_sdk_1.transform)({ updatedProductOptions }, ({ updatedProductOptions }) => {
        const arr = Array.isArray(updatedProductOptions)
            ? updatedProductOptions
            : [updatedProductOptions];
        return arr?.map((v) => {
            return { id: v.id };
        });
    });
    (0, emit_event_1.emitEventStep)({
        eventName: utils_1.ProductOptionWorkflowEvents.UPDATED,
        data: optionIdEvents,
    });
    return new workflows_sdk_1.WorkflowResponse(updatedProductOptions, {
        hooks: [productOptionsUpdated],
    });
});
//# sourceMappingURL=update-product-options.js.map