import { Constructor, IDmlEntity, ModuleExports } from "@medusajs/types";
import { InfersLinksConfig } from "./types/links-config";
/**
 * Wrapper to build the module export and auto generate the joiner config if not already provided in the module service, as well as
 * return a linkable object based on the models
 *
 * @param serviceName
 * @param service
 * @param loaders
 */
export declare function Module<const ServiceName extends string, const Service extends Constructor<any>, ModelObjects extends Record<string, IDmlEntity<any, any>> = Service extends {
    $modelObjects: any;
} ? Service["$modelObjects"] : {}, Linkable = keyof ModelObjects extends never ? Record<string, any> : InfersLinksConfig<ServiceName, ModelObjects>>(serviceName: ServiceName, { service, loaders }: ModuleExports<Service>): ModuleExports<Service> & {
    linkable: Linkable;
};
//# sourceMappingURL=module.d.ts.map