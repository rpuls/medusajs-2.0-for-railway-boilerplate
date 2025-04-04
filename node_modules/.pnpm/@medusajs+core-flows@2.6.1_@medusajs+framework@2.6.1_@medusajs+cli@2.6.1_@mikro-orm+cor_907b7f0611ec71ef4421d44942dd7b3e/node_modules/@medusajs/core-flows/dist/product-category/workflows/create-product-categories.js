"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProductCategoriesWorkflow = exports.createProductCategoriesWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../common");
const steps_1 = require("../steps");
exports.createProductCategoriesWorkflowId = "create-product-categories";
/**
 * This workflow creates one or more product categories. It's used by the
 * [Create Product Category Admin API Route](https://docs.medusajs.com/api/admin#product-categories_postproductcategories).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * create product categories within your custom flows.
 *
 * @example
 * const { result } = await createProductCategoriesWorkflow(container)
 * .run({
 *   input: {
 *     product_categories: [
 *       {
 *         name: "Shoes",
 *       }
 *     ]
 *   }
 * })
 *
 * @summary
 *
 * Create product categories.
 */
exports.createProductCategoriesWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.createProductCategoriesWorkflowId, (input) => {
    const createdCategories = (0, steps_1.createProductCategoriesStep)(input);
    const productCategoryIdEvents = (0, workflows_sdk_1.transform)({ createdCategories }, ({ createdCategories }) => {
        return createdCategories.map((v) => {
            return { id: v.id };
        });
    });
    (0, common_1.emitEventStep)({
        eventName: utils_1.ProductCategoryWorkflowEvents.CREATED,
        data: productCategoryIdEvents,
    });
    const categoriesCreated = (0, workflows_sdk_1.createHook)("categoriesCreated", {
        categories: createdCategories,
        additional_data: input.additional_data,
    });
    return new workflows_sdk_1.WorkflowResponse(createdCategories, {
        hooks: [categoriesCreated],
    });
});
//# sourceMappingURL=create-product-categories.js.map