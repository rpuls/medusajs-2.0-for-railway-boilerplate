import { CreateOrderReturnReasonDTO } from "@medusajs/framework/types";
export declare const createReturnReasonsStepId = "create-return-reasons";
/**
 * This step creates one or more return reasons.
 *
 * @example
 * const data = createReturnReasonsStep([
 *   {
 *     label: "Damaged",
 *     value: "damaged",
 *   }
 * ])
 */
export declare const createReturnReasonsStep: import("@medusajs/framework/workflows-sdk").StepFunction<CreateOrderReturnReasonDTO[], import("@medusajs/framework/types").OrderReturnReasonDTO[]>;
//# sourceMappingURL=create-return-reasons.d.ts.map