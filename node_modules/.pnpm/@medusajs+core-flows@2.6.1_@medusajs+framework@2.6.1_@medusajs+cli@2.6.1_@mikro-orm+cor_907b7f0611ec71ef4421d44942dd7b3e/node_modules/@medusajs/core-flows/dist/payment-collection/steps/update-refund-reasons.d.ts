import { UpdateRefundReasonDTO } from "@medusajs/framework/types";
/**
 * The refund reasons to update.
 */
export type UpdateRefundReasonStepInput = UpdateRefundReasonDTO[];
export declare const updateRefundReasonStepId = "update-refund-reasons";
/**
 * This step updates one or more refund reasons.
 */
export declare const updateRefundReasonsStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdateRefundReasonStepInput, import("@medusajs/framework/types").RefundReasonDTO[]>;
//# sourceMappingURL=update-refund-reasons.d.ts.map