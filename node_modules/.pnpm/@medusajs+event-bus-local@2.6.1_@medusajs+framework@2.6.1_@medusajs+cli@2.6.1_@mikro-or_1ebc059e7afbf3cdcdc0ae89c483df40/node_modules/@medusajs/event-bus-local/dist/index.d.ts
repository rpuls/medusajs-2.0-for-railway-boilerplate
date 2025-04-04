import { ModuleExports } from "@medusajs/framework/types";
import LocalEventBus from "./services/event-bus-local";
export declare const service: typeof LocalEventBus;
export declare const loaders: (({ logger }: import("@medusajs/framework/types").LoaderOptions) => Promise<void>)[];
declare const moduleDefinition: ModuleExports;
export default moduleDefinition;
export * from "./initialize";
//# sourceMappingURL=index.d.ts.map