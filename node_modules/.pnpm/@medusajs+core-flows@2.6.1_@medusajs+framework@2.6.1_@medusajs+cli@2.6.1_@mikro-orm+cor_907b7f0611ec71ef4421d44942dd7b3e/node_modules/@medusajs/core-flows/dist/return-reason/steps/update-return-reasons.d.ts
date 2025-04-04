import { FilterableOrderReturnReasonProps, ReturnReasonUpdatableFields } from "@medusajs/framework/types";
/**
 * The data to update return reasons.
 */
type UpdateReturnReasonStepInput = {
    /**
     * The filters to select the return reasons to update.
     */
    selector: FilterableOrderReturnReasonProps;
    /**
     * The data to update in the return reasons.
     */
    update: ReturnReasonUpdatableFields;
};
export declare const updateReturnReasonStepId = "update-return-reasons";
/**
 * This step updates return reasons matching the specified filters.
 *
 * @example
 * const data = updateReturnReasonsStep({
 *   selector: {
 *     id: "rr_123",
 *   },
 *   update: {
 *     value: "damaged",
 *   }
 * })
 */
export declare const updateReturnReasonsStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdateReturnReasonStepInput, import("@medusajs/framework/types").OrderReturnReasonDTO[]>;
export {};
//# sourceMappingURL=update-return-reasons.d.ts.map