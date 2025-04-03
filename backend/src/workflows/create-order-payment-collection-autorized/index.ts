import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { createOrderPaymentCollectionAutorizedStep } from "./steps/create-order-payment-collection-autorized";
import {
  BigNumberValue,
  PaymentCollectionStatus,
} from "@medusajs/framework/types";

export type CreatePaymentCollectionAutorizedInput = {
  orderId: string;
  amount: BigNumberValue;
  authorized_amount?: BigNumberValue;
  captured_amount?: BigNumberValue;
  currencyCode: string;
  regionId: string;
  status: PaymentCollectionStatus;
};

export const createOrderPaymentCollectionAutorizedWorkflow = createWorkflow(
  "create-order-payment-collection-autorized",
  (input: CreatePaymentCollectionAutorizedInput) => {
    const paymentCollection = createOrderPaymentCollectionAutorizedStep(input);
    return new WorkflowResponse(paymentCollection);
  }
);
