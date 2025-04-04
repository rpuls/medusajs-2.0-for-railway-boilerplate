import StripeBase from "../core/stripe-base";
import { PaymentIntentOptions } from "../types";
declare class StripeProviderService extends StripeBase {
    static identifier: string;
    constructor(_: any, options: any);
    get paymentIntentOptions(): PaymentIntentOptions;
}
export default StripeProviderService;
//# sourceMappingURL=stripe-provider.d.ts.map