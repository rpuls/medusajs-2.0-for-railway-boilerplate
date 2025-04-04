import { RegisterOrderChangeDTO } from "@medusajs/framework/types";
/**
 * The input of the register order changes step.
 */
export type RegisterOrderChangeStepInput = RegisterOrderChangeDTO[];
export declare const registerOrderChangeStepId = "register-order-change";
/**
 * This step registers an order changes.
 */
export declare const registerOrderChangesStep: import("@medusajs/framework/workflows-sdk").StepFunction<RegisterOrderChangeStepInput, undefined>;
//# sourceMappingURL=register-order-changes.d.ts.map