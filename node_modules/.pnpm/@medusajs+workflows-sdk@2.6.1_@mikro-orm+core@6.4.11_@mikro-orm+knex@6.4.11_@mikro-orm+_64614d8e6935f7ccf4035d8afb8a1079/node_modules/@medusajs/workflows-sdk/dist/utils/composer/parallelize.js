"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parallelize = parallelize;
const utils_1 = require("@medusajs/utils");
/**
 * This function is used to run multiple steps in parallel. The result of each step will be returned as part of the result array.
 *
 * @typeParam TResult - The type of the expected result.
 *
 * @returns The step results. The results are ordered in the array by the order they're passed in the function's parameter.
 *
 * @example
 * import {
 *   createWorkflow,
 *   parallelize,
 *   WorkflowResponse
 * } from "@medusajs/framework/workflows-sdk"
 * import {
 *   createProductStep,
 *   createPricesStep,
 *   attachProductToSalesChannelStep
 * } from "./steps"
 *
 * interface WorkflowInput {
 *   title: string
 * }
 *
 * const myWorkflow = createWorkflow(
 *   "my-workflow",
 *   (input: WorkflowInput) => {
 *    const product = createProductStep(input)
 *
 *    const [prices, productSalesChannel] = parallelize(
 *      createPricesStep(product),
 *      attachProductToSalesChannelStep(product)
 *    )
 *
 *    return new WorkflowResponse({
 *     prices,
 *     productSalesChannel
 *    })
 *  }
 * )
 */
function parallelize(...steps) {
    if (!global[utils_1.OrchestrationUtils.SymbolMedusaWorkflowComposerContext]) {
        throw new Error("parallelize must be used inside a createWorkflow definition");
    }
    const parallelizeBinder = global[utils_1.OrchestrationUtils.SymbolMedusaWorkflowComposerContext].parallelizeBinder;
    const resultSteps = steps.map((step) => step);
    return parallelizeBinder(function () {
        const stepOntoMerge = steps.shift();
        this.flow.mergeActions(stepOntoMerge.__step__, ...steps.map((step) => step.__step__));
        return resultSteps;
    });
}
//# sourceMappingURL=parallelize.js.map