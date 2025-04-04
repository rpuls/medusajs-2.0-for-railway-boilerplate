import { Express } from "express";
import { MedusaContainer, PluginDetails } from "@medusajs/framework/types";
type Options = {
    app: Express;
    plugins: PluginDetails[];
    container: MedusaContainer;
};
declare const _default: ({ app, container, plugins }: Options) => Promise<Express>;
export default _default;
//# sourceMappingURL=api.d.ts.map