"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProductOptionsWorkflow = exports.createProductOptionsWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const emit_event_1 = require("../../common/steps/emit-event");
const steps_1 = require("../steps");
exports.createProductOptionsWorkflowId = "create-product-options";
/**
 * This workflow creates one or more product options. It's used by the [Create Product Option Admin API Route](https://docs.medusajs.com/api/admin#products_postproductsidoptions).
 *
 * This workflow has a hook that allows you to perform custom actions on the created product options. For example, you can pass under `additional_data` custom data that
 * allows you to create custom data models linked to the product options.
 *
 * You can also use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around product-option creation.
 *
 * @example
 * const { result } = await createProductOptionsWorkflow(container)
 * .run({
 *   input: {
 *     product_options: [
 *       {
 *         title: "Size",
 *         values: ["S", "M", "L", "XL"]
 *       },
 *       {
 *         title: "Color",
 *         values: ["Red", "Blue", "Green"]
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
 * Create one or more product options.
 *
 * @property hooks.productOptionsCreated - This hook is executed after the product options are created. You can consume this hook to perform custom actions on the created product options.
 */
exports.createProductOptionsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.createProductOptionsWorkflowId, (input) => {
    const productOptions = (0, steps_1.createProductOptionsStep)(input.product_options);
    const productOptionsCreated = (0, workflows_sdk_1.createHook)("productOptionsCreated", {
        product_options: productOptions,
        additional_data: input.additional_data,
    });
    const optionIdEvents = (0, workflows_sdk_1.transform)({ productOptions }, ({ productOptions }) => {
        return productOptions.map((v) => {
            return { id: v.id };
        });
    });
    (0, emit_event_1.emitEventStep)({
        eventName: utils_1.ProductOptionWorkflowEvents.CREATED,
        data: optionIdEvents,
    });
    return new workflows_sdk_1.WorkflowResponse(productOptions, {
        hooks: [productOptionsCreated],
    });
});
//# sourceMappingURL=create-product-options.js.map