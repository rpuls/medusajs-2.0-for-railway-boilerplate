import { MiddlewareVerb, RouteVerb } from "./types";
/**
 * Route represents both the middleware/routes defined via the
 * "defineMiddlewares" method and the routes scanned from
 * the filesystem.
 */
type Route = {
    /**
     * The route path.
     */
    matcher: string;
    /**
     * Function to handle the request
     */
    handler?: any;
    /**
     * The HTTP method specified as a single value
     */
    method?: RouteVerb;
    /**
     * The HTTP methods this route is supposed to handle.
     */
    methods?: MiddlewareVerb | MiddlewareVerb[];
};
/**
 * RoutesBranch represents a branch in a tree of routes. All routes are
 * part of a node in a branch. Following is the list of nodes a branch
 * can have.
 *
 * - global: Global routes for the current branch
 * - regex: Routes using Regex patterns for the current branch
 * - wildcard: Routes using the wildcard character for the current branch
 * - params: Routes using params for the current branch
 * - static: Routes with no dynamic segments for the current branch
 *
 * We separate routes under these nodes, so that we can register them with
 * their priority. Priorities are as follows:
 *
 * - global
 * - regex
 * - wildcard
 * - static
 * - params
 */
type RoutesBranch<T extends Route> = {
    global: {
        routes: T[];
        children?: {
            [segment: string]: RoutesBranch<T>;
        };
    };
    regex: {
        routes: T[];
        children?: {
            [segment: string]: RoutesBranch<T>;
        };
    };
    wildcard: {
        routes: T[];
        children?: {
            [segment: string]: RoutesBranch<T>;
        };
    };
    params: {
        routes: T[];
        children?: {
            [segment: string]: RoutesBranch<T>;
        };
    };
    static: {
        routes: T[];
        children?: {
            [segment: string]: RoutesBranch<T>;
        };
    };
};
/**
 * RoutesSorter exposes the API to sort middleware and inApp route handlers
 * by their priorities. The class converts an array of matchers to a tree
 * like structure and then sort them back to a flat array based upon the
 * priorities of different types of nodes.
 */
export declare class RoutesSorter<T extends Route> {
    #private;
    constructor(routes: T[]);
    /**
     * Returns the intermediate representation of routes as a tree.
     */
    getTree(): {
        [segment: string]: RoutesBranch<T>;
    };
    /**
     * Sort the input routes. You can optionally specify a custom
     * orderBy array. Defaults to: ["global", "wildcard", "regex", "static", "params"]
     */
    sort(orderBy?: [
        keyof RoutesBranch<T>,
        keyof RoutesBranch<T>,
        keyof RoutesBranch<T>,
        keyof RoutesBranch<T>,
        keyof RoutesBranch<T>
    ]): T[];
}
export {};
//# sourceMappingURL=routes-sorter.d.ts.map