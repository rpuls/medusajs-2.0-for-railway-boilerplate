import { CreateRefundReasonDTO } from "@medusajs/framework/types";
/**
 * The refund reasons to create.
 */
export type CreateRefundReasonStepInput = CreateRefundReasonDTO[];
export declare const createRefundReasonStepId = "create-refund-reason";
/**
 * This step creates one or more refund reasons.
 */
export declare const createRefundReasonStep: import("@medusajs/framework/workflows-sdk").StepFunction<CreateRefundReasonStepInput, import("@medusajs/framework/types").RefundReasonDTO[]>;
//# sourceMappingURL=create-refund-reasons.d.ts.map