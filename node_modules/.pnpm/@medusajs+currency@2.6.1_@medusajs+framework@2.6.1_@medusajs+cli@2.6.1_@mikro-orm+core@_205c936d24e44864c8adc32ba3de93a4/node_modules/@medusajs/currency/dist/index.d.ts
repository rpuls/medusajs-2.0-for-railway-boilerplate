import { CurrencyModuleService } from "./services";
declare const _default: import("@medusajs/types").ModuleExports<typeof CurrencyModuleService> & {
    linkable: {
        currency: {
            code: {
                serviceName: "currency";
                field: "currency";
                linkable: "currency_code";
                primaryKey: "code";
            };
            toJSON: () => {
                serviceName: "currency";
                field: "currency";
                linkable: "currency_code";
                primaryKey: "code";
            };
        };
    };
};
export default _default;
//# sourceMappingURL=index.d.ts.map