import { TransactionModelOptions } from "@medusajs/orchestration";
import { WorkflowResponse } from "./helpers/workflow-response";
import { ReturnWorkflow, WorkflowData } from "./type";
/**
 * This function creates a workflow with the provided name and a constructor function.
 * The constructor function builds the workflow from steps created by the {@link createStep} function.
 * The returned workflow is an exported workflow of type {@link ReturnWorkflow}, meaning it's not executed right away. To execute it,
 * invoke the exported workflow, then run its `run` method.
 *
 * @typeParam TData - The type of the input passed to the composer function.
 * @typeParam TResult - The type of the output returned by the composer function.
 * @typeParam THooks - The type of hooks defined in the workflow.
 *
 * @returns The created workflow. You can later execute the workflow by invoking it, then using its `run` method.
 *
 * @example
 * import {
 *   createWorkflow,
 *   WorkflowResponse
 * } from "@medusajs/framework/workflows-sdk"
 * import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
 * import {
 *   createProductStep,
 *   getProductStep,
 * } from "./steps"
 *
 * interface WorkflowInput {
 *  title: string
 * }
 *
 * const myWorkflow = createWorkflow(
 *   "my-workflow",
 *   (input: WorkflowInput) => {
 *    // Everything here will be executed and resolved later
 *    // during the execution. Including the data access.
 *
 *     const product = createProductStep(input)
 *     return new WorkflowResponse(getProductStep(product.id))
 *   }
 * )
 *
 * export async function GET(
 *   req: MedusaRequest,
 *   res: MedusaResponse
 * ) {
 *   const { result: product } = await myWorkflow(req.scope)
 *     .run({
 *       input: {
 *         title: "Shirt"
 *       }
 *     })
 *
 *   res.json({
 *     product
 *   })
 * }
 */
export declare function createWorkflow<TData, TResult, THooks extends any[]>(
/**
 * The name of the workflow or its configuration.
 */
nameOrConfig: string | ({
    name: string;
} & TransactionModelOptions), 
/**
 * The constructor function that is executed when the `run` method in {@link ReturnWorkflow} is used.
 * The function can't be an arrow function or an asynchronus function. It also can't directly manipulate data.
 * You'll have to use the {@link transform} function if you need to directly manipulate data.
 */
composer: (input: WorkflowData<TData>) => void | WorkflowResponse<TResult, THooks>): ReturnWorkflow<TData, TResult, THooks>;
//# sourceMappingURL=create-workflow.d.ts.map