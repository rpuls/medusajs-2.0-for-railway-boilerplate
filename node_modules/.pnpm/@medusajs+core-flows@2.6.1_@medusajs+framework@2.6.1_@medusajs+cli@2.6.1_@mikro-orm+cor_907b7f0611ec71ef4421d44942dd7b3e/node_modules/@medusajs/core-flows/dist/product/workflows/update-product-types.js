"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductTypesWorkflow = exports.updateProductTypesWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const emit_event_1 = require("../../common/steps/emit-event");
const steps_1 = require("../steps");
exports.updateProductTypesWorkflowId = "update-product-types";
/**
 * This workflow updates one or more product types. It's used by the
 * [Update Product Type Admin API Route](https://docs.medusajs.com/api/admin#product-types_postproducttypesid).
 *
 * This workflow has a hook that allows you to perform custom actions on the updated product types. For example, you can pass under `additional_data` custom data that
 * allows you to update custom data models linked to the product types.
 *
 * You can also use this workflow within your own custom workflows, allowing you to wrap custom logic around product-type updates.
 *
 * @example
 * const { result } = await updateProductTypesWorkflow(container)
 * .run({
 *   input: {
 *     selector: {
 *       id: "ptyp_123"
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
 * Update one or more product types.
 *
 * @property hooks.productTypesUpdated - This hook is executed after the product types are updated. You can consume this hook to perform custom actions on the updated product types.
 */
exports.updateProductTypesWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.updateProductTypesWorkflowId, (input) => {
    const updatedProductTypes = (0, steps_1.updateProductTypesStep)(input);
    const productTypesUpdated = (0, workflows_sdk_1.createHook)("productTypesUpdated", {
        product_types: updatedProductTypes,
        additional_data: input.additional_data,
    });
    const typeIdEvents = (0, workflows_sdk_1.transform)({ updatedProductTypes }, ({ updatedProductTypes }) => {
        const arr = Array.isArray(updatedProductTypes)
            ? updatedProductTypes
            : [updatedProductTypes];
        return arr?.map((v) => {
            return { id: v.id };
        });
    });
    (0, emit_event_1.emitEventStep)({
        eventName: utils_1.ProductTypeWorkflowEvents.UPDATED,
        data: typeIdEvents,
    });
    return new workflows_sdk_1.WorkflowResponse(updatedProductTypes, {
        hooks: [productTypesUpdated],
    });
});
//# sourceMappingURL=update-product-types.js.map