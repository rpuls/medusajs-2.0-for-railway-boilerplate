"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProductTagsWorkflow = exports.createProductTagsWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const emit_event_1 = require("../../common/steps/emit-event");
const steps_1 = require("../steps");
exports.createProductTagsWorkflowId = "create-product-tags";
/**
 * This workflow creates one or more product tags. It's used by the
 * [Create Product Tag Admin API Route](https://docs.medusajs.com/api/admin#product-tags_postproducttags).
 *
 * This workflow has a hook that allows you to perform custom actions on the created product tags. For example, you can pass under `additional_data` custom data that
 * allows you to create custom data models linked to the product tags.
 *
 * You can also use this workflow within your own custom workflows, allowing you to wrap custom logic around product-tag creation.
 *
 * @example
 * const { result } = await createProductTagsWorkflow(container)
 * .run({
 *   input: {
 *     product_tags: [
 *       {
 *         value: "clothing"
 *       }
 *     ],
 *     additional_data: {
 *       erp_id: "123"
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Create one or more product tags.
 *
 * @property hooks.productTagsCreated - This hook is executed after the product tags are created. You can consume this hook to perform custom actions on the created product tags.
 */
exports.createProductTagsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.createProductTagsWorkflowId, (input) => {
    const productTags = (0, steps_1.createProductTagsStep)(input.product_tags);
    const productTagsCreated = (0, workflows_sdk_1.createHook)("productTagsCreated", {
        product_tags: productTags,
        additional_data: input.additional_data,
    });
    const tagIdEvents = (0, workflows_sdk_1.transform)({ productTags }, ({ productTags }) => {
        return productTags.map((v) => {
            return { id: v.id };
        });
    });
    (0, emit_event_1.emitEventStep)({
        eventName: utils_1.ProductTagWorkflowEvents.CREATED,
        data: tagIdEvents,
    });
    return new workflows_sdk_1.WorkflowResponse(productTags, {
        hooks: [productTagsCreated],
    });
});
//# sourceMappingURL=create-product-tags.js.map