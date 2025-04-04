export declare const waitConfirmationProductImportStepId = "wait-confirmation-product-import";
/**
 * This step waits until a product import is confirmed. It's useful before executing the
 * {@link batchProductsWorkflow}.
 *
 * This step is asynchronous and will make the workflow using it a [Long-Running Workflow](https://docs.medusajs.com/learn/fundamentals/workflows/long-running-workflow).
 */
export declare const waitConfirmationProductImportStep: import("@medusajs/framework/workflows-sdk").StepFunction<unknown, unknown>;
//# sourceMappingURL=wait-confirmation-product-import.d.ts.map