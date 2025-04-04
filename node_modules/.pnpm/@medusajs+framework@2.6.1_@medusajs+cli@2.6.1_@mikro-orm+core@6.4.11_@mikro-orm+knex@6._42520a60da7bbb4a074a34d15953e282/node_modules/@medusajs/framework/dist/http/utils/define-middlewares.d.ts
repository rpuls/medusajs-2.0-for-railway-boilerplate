import { MedusaNextFunction, MedusaRequest, MedusaResponse, MiddlewaresConfig, MiddlewareVerb, ParserConfig } from "../types";
import { ZodRawShape } from "zod";
/**
 * A helper function to configure the routes by defining custom middleware,
 * bodyparser config and validators to be merged with the pre-existing
 * route validators.
 */
export declare function defineMiddlewares<Route extends {
    /**
     * @deprecated. Instead use {@link MiddlewareRoute.methods}
     */
    method?: MiddlewareVerb | MiddlewareVerb[];
    methods?: MiddlewareVerb[];
    matcher: string | RegExp;
    bodyParser?: ParserConfig;
    additionalDataValidator?: ZodRawShape;
    middlewares?: (<Req extends MedusaRequest>(req: Req, res: MedusaResponse, next: MedusaNextFunction) => any)[];
}>(config: Route[] | {
    routes?: Route[];
    errorHandler?: MiddlewaresConfig["errorHandler"];
}): MiddlewaresConfig;
//# sourceMappingURL=define-middlewares.d.ts.map