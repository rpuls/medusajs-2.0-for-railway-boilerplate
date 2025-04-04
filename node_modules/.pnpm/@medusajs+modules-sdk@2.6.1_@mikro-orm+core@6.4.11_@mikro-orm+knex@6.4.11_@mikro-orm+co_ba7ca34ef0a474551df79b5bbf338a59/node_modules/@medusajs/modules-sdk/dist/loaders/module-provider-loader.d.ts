import { MedusaContainer, ModuleProvider } from "@medusajs/types";
export declare function moduleProviderLoader({ container, providers, registerServiceFn, }: {
    container: MedusaContainer;
    providers: ModuleProvider[];
    registerServiceFn?: (klass: any, container: MedusaContainer, moduleDetails: any) => Promise<void>;
}): Promise<void>;
export declare function loadModuleProvider(container: MedusaContainer, provider: ModuleProvider, registerServiceFn?: (klass: any, container: any, moduleDetails: any) => Promise<void>): Promise<any[]>;
//# sourceMappingURL=module-provider-loader.d.ts.map