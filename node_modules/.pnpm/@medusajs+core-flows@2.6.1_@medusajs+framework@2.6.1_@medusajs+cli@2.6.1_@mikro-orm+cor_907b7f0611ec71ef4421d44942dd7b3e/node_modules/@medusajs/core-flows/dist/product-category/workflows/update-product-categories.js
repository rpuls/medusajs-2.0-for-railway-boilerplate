"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductCategoriesWorkflow = exports.updateProductCategoriesWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../common");
const steps_1 = require("../steps");
exports.updateProductCategoriesWorkflowId = "update-product-categories";
/**
 * This workflow updates product categories matching specified filters. It's used by the
 * [Update Product Category Admin API Route](https://docs.medusajs.com/api/admin#product-categories_postproductcategoriesid).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * update product categories within your custom flows.
 *
 * @example
 * const { result } = await updateProductCategoriesWorkflow(container)
 * .run({
 *   input: {
 *     selector: {
 *       id: "pcat_123",
 *     },
 *     update: {
 *       name: "Shoes",
 *     }
 *   }
 * })
 *
 * @summary
 *
 * Update product categories.
 */
exports.updateProductCategoriesWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.updateProductCategoriesWorkflowId, (input) => {
    const updatedCategories = (0, steps_1.updateProductCategoriesStep)(input);
    const productCategoryIdEvents = (0, workflows_sdk_1.transform)({ updatedCategories }, ({ updatedCategories }) => {
        const arr = Array.isArray(updatedCategories)
            ? updatedCategories
            : [updatedCategories];
        return arr?.map((v) => {
            return { id: v.id };
        });
    });
    (0, common_1.emitEventStep)({
        eventName: utils_1.ProductCategoryWorkflowEvents.UPDATED,
        data: productCategoryIdEvents,
    });
    const categoriesUpdated = (0, workflows_sdk_1.createHook)("categoriesUpdated", {
        categories: updatedCategories,
        additional_data: input.additional_data,
    });
    return new workflows_sdk_1.WorkflowResponse(updatedCategories, {
        hooks: [categoriesUpdated],
    });
});
//# sourceMappingURL=update-product-categories.js.map