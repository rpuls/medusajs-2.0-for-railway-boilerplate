import { Constructor, ILinkModule, ModuleJoinerConfig } from "@medusajs/framework/types";
export declare function getModuleService(joinerConfig: ModuleJoinerConfig): Constructor<ILinkModule>;
export declare function getReadOnlyModuleService(joinerConfig: ModuleJoinerConfig): {
    new (): {
        __joinerConfig(): ModuleJoinerConfig;
    };
};
//# sourceMappingURL=dynamic-service-class.d.ts.map