import { MedusaNextFunction, MedusaRequest, MedusaResponse, MiddlewareFunction } from "../types";
/**
 * Due to how our route loader works, where we load all middlewares before routes, ambiguous routes * end up having all middlewares on different routes executed before the route handler is.
 */
/**
 * This function allows us to skip middlewares for particular routes, so we can temporarily solve * * this without completely breaking the route loader for everyone.
 */
export declare const unlessPath: (onPath: RegExp, middleware: MiddlewareFunction) => (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => any;
//# sourceMappingURL=unless-path.d.ts.map