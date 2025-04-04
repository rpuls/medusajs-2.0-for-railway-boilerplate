import { MedusaContainer } from "@medusajs/framework/types";
export declare function startApp({ cwd, env, }?: {
    cwd?: string;
    env?: Record<any, any>;
}): Promise<{
    shutdown: () => Promise<void>;
    container: MedusaContainer;
    port: number;
}>;
//# sourceMappingURL=bootstrap-app.d.ts.map