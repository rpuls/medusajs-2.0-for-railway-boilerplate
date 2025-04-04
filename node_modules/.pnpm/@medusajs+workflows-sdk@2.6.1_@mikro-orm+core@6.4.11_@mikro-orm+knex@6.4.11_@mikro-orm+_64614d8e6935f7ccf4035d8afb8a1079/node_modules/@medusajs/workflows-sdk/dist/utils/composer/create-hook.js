"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHook = createHook;
const create_step_1 = require("./create-step");
const utils_1 = require("@medusajs/utils");
const create_step_handler_1 = require("./helpers/create-step-handler");
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
function createHook(name, input) {
    const context = global[utils_1.OrchestrationUtils.SymbolMedusaWorkflowComposerContext];
    context.hookBinder(name, function () {
        /**
         * We start by registering a new step within the workflow. This will be a noop
         * step that can be replaced (optionally) by the workflow consumer.
         */
        (0, create_step_1.createStep)(name, (_) => void 0, () => void 0)(input);
        function hook(invokeFn, compensateFn) {
            const handlers = create_step_handler_1.createStepHandler.bind(this)({
                stepName: name,
                input,
                invokeFn,
                compensateFn,
            });
            if (this.hooks_.registered.includes(name)) {
                throw new Error(`Cannot define multiple hook handlers for the ${name} hook`);
            }
            this.hooks_.registered.push(name);
            this.handlers.set(name, handlers);
        }
        return hook;
    });
    return {
        __type: utils_1.OrchestrationUtils.SymbolWorkflowHook,
        name,
    };
}
//# sourceMappingURL=create-hook.js.map