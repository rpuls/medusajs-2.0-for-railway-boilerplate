import { CreateOrderTransactionDTO } from "@medusajs/framework/types";
/**
 * The transaction(s) to add to the order.
 */
export type AddOrderTransactionStepInput = CreateOrderTransactionDTO | CreateOrderTransactionDTO[];
/**
 * The added order transaction(s).
 */
export type AddOrderTransactionStepOutput = CreateOrderTransactionDTO | CreateOrderTransactionDTO[];
export declare const addOrderTransactionStepId = "add-order-transaction";
/**
 * This step creates order transactions.
 */
export declare const addOrderTransactionStep: import("@medusajs/framework/workflows-sdk").StepFunction<AddOrderTransactionStepInput, CreateOrderTransactionDTO | CreateOrderTransactionDTO[] | null>;
//# sourceMappingURL=add-order-transaction.d.ts.map