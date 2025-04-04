import { InternalModuleDeclaration, LoaderOptions, ModuleServiceInitializeCustomDataLayerOptions, ModuleServiceInitializeOptions } from "@medusajs/framework/types";
import { EntitySchema } from "@mikro-orm/core";
export declare function connectionLoader(entity: EntitySchema): ({ options, container, logger, }: LoaderOptions<ModuleServiceInitializeOptions | ModuleServiceInitializeCustomDataLayerOptions>, moduleDeclaration?: InternalModuleDeclaration) => Promise<void>;
//# sourceMappingURL=connection.d.ts.map