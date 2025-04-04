"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductTagsWorkflow = exports.updateProductTagsWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const emit_event_1 = require("../../common/steps/emit-event");
const steps_1 = require("../steps");
exports.updateProductTagsWorkflowId = "update-product-tags";
/**
 * This workflow updates one or more product tags. It's used by the
 * [Update Product Tag Admin API Route](https://docs.medusajs.com/api/admin#product-tags_postproducttagsid).
 *
 * This workflow has a hook that allows you to perform custom actions on the updated product tags. For example, you can pass under `additional_data` custom data that
 * allows you to update custom data models linked to the product tags.
 *
 * You can also use this workflow within your own custom workflows, allowing you to wrap custom logic around product-tag updates.
 *
 * @example
 * const { result } = await updateProductTagsWorkflow(container)
 * .run({
 *   input: {
 *     selector: {
 *       id: "pcol_123"
 *     },
 *     update: {
 *       value: "clothing"
 *     },
 *     additional_data: {
 *       erp_id: "123"
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Update one or more product tags.
 *
 * @property hooks.productTagsUpdated - This hook is executed after the product tags are updated. You can consume this hook to perform custom actions on the updated product tags.
 */
exports.updateProductTagsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.updateProductTagsWorkflowId, (input) => {
    const updatedProductTags = (0, steps_1.updateProductTagsStep)(input);
    const productTagsUpdated = (0, workflows_sdk_1.createHook)("productTagsUpdated", {
        product_tags: updatedProductTags,
        additional_data: input.additional_data,
    });
    const tagIdEvents = (0, workflows_sdk_1.transform)({ updatedProductTags }, ({ updatedProductTags }) => {
        const arr = Array.isArray(updatedProductTags)
            ? updatedProductTags
            : [updatedProductTags];
        return arr?.map((v) => {
            return { id: v.id };
        });
    });
    (0, emit_event_1.emitEventStep)({
        eventName: utils_1.ProductTagWorkflowEvents.UPDATED,
        data: tagIdEvents,
    });
    return new workflows_sdk_1.WorkflowResponse(updatedProductTags, {
        hooks: [productTagsUpdated],
    });
});
//# sourceMappingURL=update-product-tags.js.map