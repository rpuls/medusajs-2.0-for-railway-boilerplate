import { CreateCustomerAddressDTO, ICustomerModuleService } from "@medusajs/framework/types";
import { StepResponse } from "@medusajs/framework/workflows-sdk";
export declare const unsetForCreate: (data: CreateCustomerAddressDTO[], customerService: ICustomerModuleService, field: "is_default_billing" | "is_default_shipping") => Promise<StepResponse<undefined, string[]>>;
//# sourceMappingURL=unset-address-for-create.d.ts.map