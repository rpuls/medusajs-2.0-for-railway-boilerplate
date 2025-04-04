import type { MiddlewareVerb, RouteVerb } from "./types";
export declare class RoutesFinder<T extends {
    matcher: string;
    methods: MiddlewareVerb | MiddlewareVerb[];
} | {
    matcher: string;
    method: RouteVerb;
}> {
    #private;
    constructor(routes?: T[]);
    /**
     * Register route for lookup
     */
    add(route: T): void;
    /**
     * Get the matching route for a given HTTP method and URL
     */
    find(url: string, method: MiddlewareVerb): (T & {
        matchRegex: RegExp;
    }) | null | undefined;
}
//# sourceMappingURL=routes-finder.d.ts.map