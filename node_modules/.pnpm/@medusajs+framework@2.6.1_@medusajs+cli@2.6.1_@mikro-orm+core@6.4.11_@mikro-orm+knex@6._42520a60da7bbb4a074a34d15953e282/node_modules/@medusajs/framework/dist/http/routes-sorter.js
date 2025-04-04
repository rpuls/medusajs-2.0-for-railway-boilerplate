"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _RoutesSorter_instances, _RoutesSorter_orderBy, _RoutesSorter_routesToProcess, _RoutesSorter_routesTree, _RoutesSorter_createBranch, _RoutesSorter_processRoute, _RoutesSorter_sortBranch;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutesSorter = void 0;
/**
 * RoutesSorter exposes the API to sort middleware and inApp route handlers
 * by their priorities. The class converts an array of matchers to a tree
 * like structure and then sort them back to a flat array based upon the
 * priorities of different types of nodes.
 */
class RoutesSorter {
    constructor(routes) {
        _RoutesSorter_instances.add(this);
        /**
         * The order in which the routes will be sorted. This
         * can be overridden at the time of call the sort
         * method.
         */
        _RoutesSorter_orderBy.set(this, ["global", "wildcard", "regex", "static", "params"]
        /**
         * Input routes
         */
        );
        /**
         * Input routes
         */
        _RoutesSorter_routesToProcess.set(this, void 0);
        /**
         * Intermediate tree representation for sorting routes
         */
        _RoutesSorter_routesTree.set(this, {
            root: __classPrivateFieldGet(this, _RoutesSorter_instances, "m", _RoutesSorter_createBranch).call(this),
        });
        __classPrivateFieldSet(this, _RoutesSorter_routesToProcess, routes, "f");
    }
    /**
     * Returns the intermediate representation of routes as a tree.
     */
    getTree() {
        return __classPrivateFieldGet(this, _RoutesSorter_routesTree, "f");
    }
    /**
     * Sort the input routes. You can optionally specify a custom
     * orderBy array. Defaults to: ["global", "wildcard", "regex", "static", "params"]
     */
    sort(orderBy) {
        __classPrivateFieldGet(this, _RoutesSorter_routesToProcess, "f").map((route) => __classPrivateFieldGet(this, _RoutesSorter_instances, "m", _RoutesSorter_processRoute).call(this, route));
        return __classPrivateFieldGet(this, _RoutesSorter_instances, "m", _RoutesSorter_sortBranch).call(this, __classPrivateFieldGet(this, _RoutesSorter_routesTree, "f"), orderBy ?? __classPrivateFieldGet(this, _RoutesSorter_orderBy, "f"));
    }
}
exports.RoutesSorter = RoutesSorter;
_RoutesSorter_orderBy = new WeakMap(), _RoutesSorter_routesToProcess = new WeakMap(), _RoutesSorter_routesTree = new WeakMap(), _RoutesSorter_instances = new WeakSet(), _RoutesSorter_createBranch = function _RoutesSorter_createBranch() {
    return {
        global: {
            routes: [],
        },
        regex: {
            routes: [],
        },
        wildcard: {
            routes: [],
        },
        static: {
            routes: [],
        },
        params: {
            routes: [],
        },
    };
}, _RoutesSorter_processRoute = function _RoutesSorter_processRoute(route) {
    const segments = route.matcher.split("/").filter((s) => s.length);
    let parent = __classPrivateFieldGet(this, _RoutesSorter_routesTree, "f")["root"];
    segments.forEach((segment, index) => {
        let bucket = "static";
        if (!route.methods && !route.method) {
            bucket = "global";
        }
        else if (segment.startsWith("*")) {
            bucket = "wildcard";
        }
        else if (segment.startsWith(":")) {
            bucket = "params";
        }
        else if (/[\(\+\*\[\]\)\!]/.test(segment)) {
            bucket = "regex";
        }
        if (index + 1 === segments.length) {
            parent[bucket].routes.push(route);
            return;
        }
        parent[bucket].children = parent[bucket].children ?? {};
        parent[bucket].children[segment] =
            parent[bucket].children[segment] ?? __classPrivateFieldGet(this, _RoutesSorter_instances, "m", _RoutesSorter_createBranch).call(this);
        parent = parent[bucket].children[segment];
    });
}, _RoutesSorter_sortBranch = function _RoutesSorter_sortBranch(routeBranch, orderBy) {
    const branchRoutes = Object.keys(routeBranch).reduce((result, branchKey) => {
        const node = routeBranch[branchKey];
        result.global.push(...node.global.routes);
        if (node.global.children) {
            result.global.push(...__classPrivateFieldGet(this, _RoutesSorter_instances, "m", _RoutesSorter_sortBranch).call(this, node.global.children, orderBy));
        }
        result.wildcard.push(...node.wildcard.routes);
        if (node.wildcard.children) {
            result.wildcard.push(...__classPrivateFieldGet(this, _RoutesSorter_instances, "m", _RoutesSorter_sortBranch).call(this, node.wildcard.children, orderBy));
        }
        result.regex.push(...node.regex.routes);
        if (node.regex.children) {
            result.regex.push(...__classPrivateFieldGet(this, _RoutesSorter_instances, "m", _RoutesSorter_sortBranch).call(this, node.regex.children, orderBy));
        }
        result.static.push(...node.static.routes);
        if (node.static.children) {
            result.static.push(...__classPrivateFieldGet(this, _RoutesSorter_instances, "m", _RoutesSorter_sortBranch).call(this, node.static.children, orderBy));
        }
        result.params.push(...node.params.routes);
        if (node.params.children) {
            result.params.push(...__classPrivateFieldGet(this, _RoutesSorter_instances, "m", _RoutesSorter_sortBranch).call(this, node.params.children, orderBy));
        }
        return result;
    }, {
        global: [],
        wildcard: [],
        regex: [],
        params: [],
        static: [],
    });
    /**
     * Concatenating routes as per their priority.
     */
    return orderBy.reduce((result, branch) => {
        result = result.concat(branchRoutes[branch]);
        return result;
    }, []);
};
//# sourceMappingURL=routes-sorter.js.map