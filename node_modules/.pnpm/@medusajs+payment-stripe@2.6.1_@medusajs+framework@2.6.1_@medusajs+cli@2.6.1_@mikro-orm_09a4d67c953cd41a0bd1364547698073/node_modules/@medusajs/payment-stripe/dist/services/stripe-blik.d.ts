import StripeBase from "../core/stripe-base";
import { PaymentIntentOptions } from "../types";
declare class BlikProviderService extends StripeBase {
    static identifier: string;
    constructor(_: any, options: any);
    get paymentIntentOptions(): PaymentIntentOptions;
}
export default BlikProviderService;
//# sourceMappingURL=stripe-blik.d.ts.map