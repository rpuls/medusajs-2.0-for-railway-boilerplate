import StripeBase from "../core/stripe-base";
import { PaymentIntentOptions } from "../types";
declare class GiropayProviderService extends StripeBase {
    static identifier: string;
    constructor(_: any, options: any);
    get paymentIntentOptions(): PaymentIntentOptions;
}
export default GiropayProviderService;
//# sourceMappingURL=stripe-giropay.d.ts.map