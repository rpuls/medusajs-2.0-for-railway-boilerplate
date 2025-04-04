import { OrchestrationUtils } from "@medusajs/utils";
/**
 * Representation of a hook definition.
 */
export type Hook<Name extends string, Input> = {
    __type: typeof OrchestrationUtils.SymbolWorkflowHook;
    name: Name;
    /**
     * By prefixing a key with a space, we remove it from the
     * intellisense of TypeScript. This is needed because
     * input is not set at runtime. It is a type-only
     * property to infer input data type of a hook
     */
    " input": Input;
};
/**
 * Expose a hook in your workflow where you can inject custom functionality as a step function.
 *
 * A handler hook can later be registered to consume the hook and perform custom functionality.
 *
 * Learn more in [this documentation](https://docs.medusajs.com/learn/fundamentals/workflows/workflow-hooks).
 *
 * @param name - The hook's name. This is used when the hook handler is registered to consume the workflow.
 * @param input - The input to pass to the hook handler.
 * @returns A workflow hook.
 *
 * @example
 * import {
 *   createStep,
 *   createHook,
 *   createWorkflow,
 *   WorkflowResponse,
 * } from "@medusajs/framework/workflows-sdk"
 * import { createProductStep } from "./steps/create-product"
 *
 * export const myWorkflow = createWorkflow(
 *   "my-workflow",
 *   function (input) {
 *     const product = createProductStep(input)
 *     const productCreatedHook = createHook(
 *       "productCreated",
 *       { productId: product.id }
 *     )
 *
 *     return new WorkflowResponse(product, {
 *       hooks: [productCreatedHook],
 *     })
 *   }
 * )
 */
export declare function createHook<Name extends string, TInvokeInput>(name: Name, input: TInvokeInput): Hook<Name, TInvokeInput>;
//# sourceMappingURL=create-hook.d.ts.map