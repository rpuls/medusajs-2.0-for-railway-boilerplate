import StripeBase from "../core/stripe-base";
import { PaymentIntentOptions } from "../types";
declare class PromptpayProviderService extends StripeBase {
    static identifier: string;
    constructor(_: any, options: any);
    get paymentIntentOptions(): PaymentIntentOptions;
}
export default PromptpayProviderService;
//# sourceMappingURL=stripe-promptpay.d.ts.map