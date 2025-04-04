import { AuthorizePaymentInput, AuthorizePaymentOutput, CancelPaymentInput, CancelPaymentOutput, CapturePaymentInput, CapturePaymentOutput, CreateAccountHolderInput, CreateAccountHolderOutput, DAL, DeleteAccountHolderInput, DeleteAccountHolderOutput, DeletePaymentInput, DeletePaymentOutput, GetPaymentStatusInput, GetPaymentStatusOutput, InitiatePaymentInput, InitiatePaymentOutput, IPaymentProvider, ListPaymentMethodsInput, ListPaymentMethodsOutput, Logger, ProviderWebhookPayload, RefundPaymentInput, RefundPaymentOutput, SavePaymentMethodInput, SavePaymentMethodOutput, UpdateAccountHolderInput, UpdateAccountHolderOutput, UpdatePaymentInput, UpdatePaymentOutput, WebhookActionResult } from "@medusajs/framework/types";
type InjectedDependencies = {
    logger?: Logger;
    paymentProviderRepository: DAL.RepositoryService;
    [key: `pp_${string}`]: IPaymentProvider;
};
declare const PaymentProviderService_base: new (container: InjectedDependencies) => import("@medusajs/framework/types").IMedusaInternalService<any, InjectedDependencies>;
export default class PaymentProviderService extends PaymentProviderService_base {
    #private;
    constructor(container: InjectedDependencies);
    retrieveProvider(providerId: string): IPaymentProvider;
    createSession(providerId: string, sessionInput: InitiatePaymentInput): Promise<InitiatePaymentOutput>;
    updateSession(providerId: string, sessionInput: UpdatePaymentInput): Promise<UpdatePaymentOutput>;
    deleteSession(providerId: string, input: DeletePaymentInput): Promise<DeletePaymentOutput>;
    authorizePayment(providerId: string, input: AuthorizePaymentInput): Promise<AuthorizePaymentOutput>;
    getStatus(providerId: string, input: GetPaymentStatusInput): Promise<GetPaymentStatusOutput>;
    capturePayment(providerId: string, input: CapturePaymentInput): Promise<CapturePaymentOutput>;
    cancelPayment(providerId: string, input: CancelPaymentInput): Promise<CancelPaymentOutput>;
    refundPayment(providerId: string, input: RefundPaymentInput): Promise<RefundPaymentOutput>;
    createAccountHolder(providerId: string, input: CreateAccountHolderInput): Promise<CreateAccountHolderOutput>;
    updateAccountHolder(providerId: string, input: UpdateAccountHolderInput): Promise<UpdateAccountHolderOutput>;
    deleteAccountHolder(providerId: string, input: DeleteAccountHolderInput): Promise<DeleteAccountHolderOutput>;
    listPaymentMethods(providerId: string, input: ListPaymentMethodsInput): Promise<ListPaymentMethodsOutput>;
    savePaymentMethod(providerId: string, input: SavePaymentMethodInput): Promise<SavePaymentMethodOutput>;
    getWebhookActionAndData(providerId: string, data: ProviderWebhookPayload["payload"]): Promise<WebhookActionResult>;
}
export {};
//# sourceMappingURL=payment-provider.d.ts.map