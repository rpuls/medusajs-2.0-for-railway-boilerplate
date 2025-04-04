import { ConfigModule, PluginDetails } from "@medusajs/framework/types";
import { Express } from "express";
type Options = {
    app: Express;
    configModule: ConfigModule;
    rootDirectory: string;
    plugins: PluginDetails[];
};
export default function adminLoader({ app, configModule, rootDirectory, plugins, }: Options): Promise<Express>;
export {};
//# sourceMappingURL=admin.d.ts.map