import { CaptureDTO, Context, CreateCaptureDTO, CreatePaymentCollectionDTO, CreatePaymentMethodDTO, CreatePaymentSessionDTO, CreateRefundDTO, AccountHolderDTO, DAL, FilterablePaymentCollectionProps, FilterablePaymentMethodProps, FilterablePaymentProviderProps, FindConfig, InferEntityType, InternalModuleDeclaration, IPaymentModuleService, Logger, ModuleJoinerConfig, ModulesSdkTypes, PaymentCollectionDTO, PaymentCollectionUpdatableFields, PaymentDTO, PaymentMethodDTO, PaymentProviderDTO, PaymentSessionDTO, ProviderWebhookPayload, RefundDTO, RefundReasonDTO, UpdatePaymentCollectionDTO, UpdatePaymentDTO, UpdatePaymentSessionDTO, CreateAccountHolderDTO, UpsertPaymentCollectionDTO, WebhookActionResult, UpdateAccountHolderDTO } from "@medusajs/framework/types";
import { ModulesSdkUtils, PaymentSessionStatus } from "@medusajs/framework/utils";
import { AccountHolder, Capture, Payment, PaymentCollection, PaymentSession, Refund } from "../models";
import PaymentProviderService from "./payment-provider";
type InjectedDependencies = {
    logger?: Logger;
    baseRepository: DAL.RepositoryService;
    paymentService: ModulesSdkTypes.IMedusaInternalService<any>;
    captureService: ModulesSdkTypes.IMedusaInternalService<any>;
    refundService: ModulesSdkTypes.IMedusaInternalService<any>;
    paymentSessionService: ModulesSdkTypes.IMedusaInternalService<any>;
    paymentCollectionService: ModulesSdkTypes.IMedusaInternalService<any>;
    accountHolderService: ModulesSdkTypes.IMedusaInternalService<any>;
    paymentProviderService: PaymentProviderService;
};
declare const PaymentModuleService_base: ModulesSdkUtils.MedusaServiceReturnType<{
    PaymentCollection: {
        dto: PaymentCollectionDTO;
    };
    PaymentSession: {
        dto: PaymentSessionDTO;
    };
    Payment: {
        dto: PaymentDTO;
    };
    Capture: {
        dto: CaptureDTO;
    };
    Refund: {
        dto: RefundDTO;
    };
    RefundReason: {
        dto: RefundReasonDTO;
    };
    AccountHolder: {
        dto: AccountHolderDTO;
    };
}>;
export default class PaymentModuleService extends PaymentModuleService_base implements IPaymentModuleService {
    protected readonly moduleDeclaration: InternalModuleDeclaration;
    protected baseRepository_: DAL.RepositoryService;
    protected paymentService_: ModulesSdkTypes.IMedusaInternalService<typeof Payment>;
    protected captureService_: ModulesSdkTypes.IMedusaInternalService<typeof Capture>;
    protected refundService_: ModulesSdkTypes.IMedusaInternalService<typeof Refund>;
    protected paymentSessionService_: ModulesSdkTypes.IMedusaInternalService<typeof PaymentSession>;
    protected paymentCollectionService_: ModulesSdkTypes.IMedusaInternalService<typeof PaymentCollection>;
    protected paymentProviderService_: PaymentProviderService;
    protected accountHolderService_: ModulesSdkTypes.IMedusaInternalService<typeof AccountHolder>;
    constructor({ baseRepository, paymentService, captureService, refundService, paymentSessionService, paymentProviderService, paymentCollectionService, accountHolderService, }: InjectedDependencies, moduleDeclaration: InternalModuleDeclaration);
    __joinerConfig(): ModuleJoinerConfig;
    createPaymentCollections(data: CreatePaymentCollectionDTO, sharedContext?: Context): Promise<PaymentCollectionDTO>;
    createPaymentCollections(data: CreatePaymentCollectionDTO[], sharedContext?: Context): Promise<PaymentCollectionDTO[]>;
    createPaymentCollections_(data: CreatePaymentCollectionDTO[], sharedContext?: Context): Promise<InferEntityType<typeof PaymentCollection>[]>;
    updatePaymentCollections(paymentCollectionId: string, data: PaymentCollectionUpdatableFields, sharedContext?: Context): Promise<PaymentCollectionDTO>;
    updatePaymentCollections(selector: FilterablePaymentCollectionProps, data: PaymentCollectionUpdatableFields, sharedContext?: Context): Promise<PaymentCollectionDTO[]>;
    updatePaymentCollections_(data: UpdatePaymentCollectionDTO[], sharedContext?: Context): Promise<InferEntityType<typeof PaymentCollection>[]>;
    upsertPaymentCollections(data: UpsertPaymentCollectionDTO[], sharedContext?: Context): Promise<PaymentCollectionDTO[]>;
    upsertPaymentCollections(data: UpsertPaymentCollectionDTO, sharedContext?: Context): Promise<PaymentCollectionDTO>;
    completePaymentCollections(paymentCollectionId: string, sharedContext?: Context): Promise<PaymentCollectionDTO>;
    completePaymentCollections(paymentCollectionId: string[], sharedContext?: Context): Promise<PaymentCollectionDTO[]>;
    createPaymentSession(paymentCollectionId: string, input: CreatePaymentSessionDTO, sharedContext?: Context): Promise<PaymentSessionDTO>;
    createPaymentSession_(paymentCollectionId: string, data: CreatePaymentSessionDTO, sharedContext?: Context): Promise<InferEntityType<typeof PaymentSession>>;
    updatePaymentSession(data: UpdatePaymentSessionDTO, sharedContext?: Context): Promise<PaymentSessionDTO>;
    deletePaymentSession(id: string, sharedContext?: Context): Promise<void>;
    authorizePaymentSession(id: string, context: Record<string, unknown>, sharedContext?: Context): Promise<PaymentDTO>;
    authorizePaymentSession_(session: InferEntityType<typeof PaymentSession>, data: Record<string, unknown> | undefined, status: PaymentSessionStatus, sharedContext?: Context): Promise<InferEntityType<typeof Payment>>;
    updatePayment(data: UpdatePaymentDTO, sharedContext?: Context): Promise<PaymentDTO>;
    capturePayment(data: CreateCaptureDTO, sharedContext?: Context): Promise<PaymentDTO>;
    private capturePayment_;
    private capturePaymentFromProvider_;
    refundPayment(data: CreateRefundDTO, sharedContext?: Context): Promise<PaymentDTO>;
    private refundPayment_;
    private refundPaymentFromProvider_;
    cancelPayment(paymentId: string, sharedContext?: Context): Promise<PaymentDTO>;
    private maybeUpdatePaymentCollection_;
    listPaymentProviders(filters?: FilterablePaymentProviderProps, config?: FindConfig<PaymentProviderDTO>, sharedContext?: Context): Promise<PaymentProviderDTO[]>;
    listAndCountPaymentProviders(filters?: FilterablePaymentProviderProps, config?: FindConfig<PaymentProviderDTO>, sharedContext?: Context): Promise<[PaymentProviderDTO[], number]>;
    createAccountHolder(input: CreateAccountHolderDTO, sharedContext?: Context): Promise<AccountHolderDTO>;
    updateAccountHolder(input: UpdateAccountHolderDTO, sharedContext?: Context): Promise<AccountHolderDTO>;
    deleteAccountHolder(id: string, sharedContext?: Context): Promise<void>;
    listPaymentMethods(filters: FilterablePaymentMethodProps, config?: FindConfig<PaymentMethodDTO>, sharedContext?: Context): Promise<PaymentMethodDTO[]>;
    listAndCountPaymentMethods(filters: FilterablePaymentMethodProps, config?: FindConfig<PaymentMethodDTO>, sharedContext?: Context): Promise<[PaymentMethodDTO[], number]>;
    createPaymentMethods(data: CreatePaymentMethodDTO, sharedContext?: Context): Promise<PaymentMethodDTO>;
    createPaymentMethods(data: CreatePaymentMethodDTO[], sharedContext?: Context): Promise<PaymentMethodDTO[]>;
    getWebhookActionAndData(eventData: ProviderWebhookPayload, sharedContext?: Context): Promise<WebhookActionResult>;
}
export {};
//# sourceMappingURL=payment-module.d.ts.map