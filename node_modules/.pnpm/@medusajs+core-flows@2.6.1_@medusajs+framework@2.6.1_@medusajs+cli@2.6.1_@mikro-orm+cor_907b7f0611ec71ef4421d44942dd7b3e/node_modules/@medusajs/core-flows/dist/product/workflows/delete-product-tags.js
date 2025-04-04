"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProductTagsWorkflow = exports.deleteProductTagsWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const emit_event_1 = require("../../common/steps/emit-event");
const steps_1 = require("../steps");
exports.deleteProductTagsWorkflowId = "delete-product-tags";
/**
 * This workflow deletes one or more product tags. It's used by the
 * [Delete Product Tags Admin API Route](https://docs.medusajs.com/api/admin#product-tags_deleteproducttagsid).
 *
 * This workflow has a hook that allows you to perform custom actions after the product tags are deleted. For example,
 * you can delete custom records linked to the product tags.
 *
 * You can also use this workflow within your own custom workflows, allowing you to wrap custom logic around product-tag deletion.
 *
 * @example
 * const { result } = await deleteProductTagsWorkflow(container)
 * .run({
 *   input: {
 *     ids: ["ptag_123"],
 *   }
 * })
 *
 * @summary
 *
 * Delete one or more product tags.
 *
 * @property hooks.productTagsDeleted - This hook is executed after the tags are deleted. You can consume this hook to perform custom actions on the deleted tags.
 */
exports.deleteProductTagsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.deleteProductTagsWorkflowId, (input) => {
    const deletedProductTags = (0, steps_1.deleteProductTagsStep)(input.ids);
    const productTagsDeleted = (0, workflows_sdk_1.createHook)("productTagsDeleted", {
        ids: input.ids,
    });
    const tagIdEvents = (0, workflows_sdk_1.transform)({ input }, ({ input }) => {
        return input.ids?.map((id) => {
            return { id };
        });
    });
    (0, emit_event_1.emitEventStep)({
        eventName: utils_1.ProductTagWorkflowEvents.DELETED,
        data: tagIdEvents,
    });
    return new workflows_sdk_1.WorkflowResponse(deletedProductTags, {
        hooks: [productTagsDeleted],
    });
});
//# sourceMappingURL=delete-product-tags.js.map