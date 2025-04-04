import StripeBase from "../core/stripe-base";
import { PaymentIntentOptions } from "../types";
declare class BancontactProviderService extends StripeBase {
    static identifier: string;
    constructor(_: any, options: any);
    get paymentIntentOptions(): PaymentIntentOptions;
}
export default BancontactProviderService;
//# sourceMappingURL=stripe-bancontact.d.ts.map