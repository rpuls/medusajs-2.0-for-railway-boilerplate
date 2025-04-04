import { Express } from "express";
export declare function expressLoader({ app }: {
    app: Express;
}): Promise<{
    app: Express;
    shutdown: () => Promise<void>;
}>;
//# sourceMappingURL=express-loader.d.ts.map