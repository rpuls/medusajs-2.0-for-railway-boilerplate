import { FilterableCustomerAddressProps, ICustomerModuleService, UpdateCustomerAddressDTO } from "@medusajs/framework/types";
import { StepResponse } from "@medusajs/framework/workflows-sdk";
export declare const unsetForUpdate: (data: {
    selector: FilterableCustomerAddressProps;
    update: UpdateCustomerAddressDTO;
}, customerService: ICustomerModuleService, field: "is_default_billing" | "is_default_shipping") => Promise<StepResponse<undefined, undefined> | StepResponse<undefined, string[]>>;
//# sourceMappingURL=unset-address-for-update.d.ts.map