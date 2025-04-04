import { StepExecutionContext, WorkflowData } from "./type";
type ConditionFunction<T extends object | WorkflowData> = (input: T extends WorkflowData<infer U> ? U : T extends object ? {
    [K in keyof T]: T[K] extends WorkflowData<infer U> ? U : T[K];
} : {}, context: StepExecutionContext) => boolean;
type ThenFunc = <ThenResolver extends () => any>(resolver: ThenResolver) => ReturnType<ThenResolver> extends WorkflowData<infer ReturnedWorkflowData> ? WorkflowData<ReturnedWorkflowData> | undefined : ReturnType<ThenResolver>;
/**
 * This function allows you to execute steps only if a condition is satisfied. As you can't use if conditions in
 * a workflow's constructor function, use `when-then` instead.
 *
 * Learn more about why you can't use if conditions and `when-then` in [this documentation](https://docs.medusajs.com/learn/fundamentals/workflows/conditions).
 *
 * @param values - The data to pass to the second parameter function.
 * @param condition - A function that returns a boolean value, indicating whether the steps in `then` should be executed.
 *
 * @example
 * import {
 *   createWorkflow,
 *   WorkflowResponse,
 *   when,
 * } from "@medusajs/framework/workflows-sdk"
 * // step imports...
 *
 * export const workflow = createWorkflow(
 *   "workflow",
 *   function (input: {
 *     is_active: boolean
 *   }) {
 *
 *     const result = when(
 *       input,
 *       (input) => {
 *         return input.is_active
 *       }
 *     ).then(() => {
 *       const stepResult = isActiveStep()
 *       return stepResult
 *     })
 *
 *     // executed without condition
 *     const anotherStepResult = anotherStep(result)
 *
 *     return new WorkflowResponse(
 *       anotherStepResult
 *     )
 *   }
 * )
 */
export declare function when<T extends object | WorkflowData, Then extends Function>(values: T, condition: ConditionFunction<T>): {
    then: ThenFunc;
};
/**
 * @internal
 */
export declare function when<T extends object | WorkflowData, Then extends Function>(name: string, values: T, condition: ConditionFunction<T>): {
    then: ThenFunc;
};
export {};
//# sourceMappingURL=when.d.ts.map