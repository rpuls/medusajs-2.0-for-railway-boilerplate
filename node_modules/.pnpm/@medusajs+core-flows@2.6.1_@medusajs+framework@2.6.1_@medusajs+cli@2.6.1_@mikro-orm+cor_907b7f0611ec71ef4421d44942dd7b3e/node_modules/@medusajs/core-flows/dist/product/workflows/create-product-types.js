"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProductTypesWorkflow = exports.createProductTypesWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const emit_event_1 = require("../../common/steps/emit-event");
const steps_1 = require("../steps");
exports.createProductTypesWorkflowId = "create-product-types";
/**
 * This workflow creates one or more product types. It's used by the
 * [Create Product Type Admin API Route](https://docs.medusajs.com/api/admin#product-types_postproducttypes).
 *
 * This workflow has a hook that allows you to perform custom actions on the created product types. For example, you can pass under `additional_data` custom data that
 * allows you to create custom data models linked to the product types.
 *
 * You can also use this workflow within your own custom workflows, allowing you to wrap custom logic around product-type creation.
 *
 * @example
 * const { result } = await createProductTypesWorkflow(container)
 * .run({
 *   input: {
 *     product_types: [
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
 * Create one or more product types.
 *
 * @property hooks.productTypesCreated - This hook is executed after the product types are created. You can consume this hook to perform custom actions on the created product types.
 */
exports.createProductTypesWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.createProductTypesWorkflowId, (input) => {
    const productTypes = (0, steps_1.createProductTypesStep)(input.product_types);
    const productTypesCreated = (0, workflows_sdk_1.createHook)("productTypesCreated", {
        product_types: productTypes,
        additional_data: input.additional_data,
    });
    const typeIdEvents = (0, workflows_sdk_1.transform)({ productTypes }, ({ productTypes }) => {
        return productTypes.map((v) => {
            return { id: v.id };
        });
    });
    (0, emit_event_1.emitEventStep)({
        eventName: utils_1.ProductTypeWorkflowEvents.CREATED,
        data: typeIdEvents,
    });
    return new workflows_sdk_1.WorkflowResponse(productTypes, {
        hooks: [productTypesCreated],
    });
});
//# sourceMappingURL=create-product-types.js.map