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
var _Tracer_otTracer;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tracer = void 0;
const api_1 = require("@opentelemetry/api");
/**
 * Tracer creates an instrumentation scope within the application
 * code. For example: You might create a tracer for the API
 * requests, another one for the modules, one for workflows
 * and so on.
 *
 * There is no need to create a Tracer instance per HTTP
 * call.
 */
class Tracer {
    constructor(name, version) {
        this.name = name;
        this.version = version;
        /**
         * Reference to the underlying OpenTelemetry tracer
         */
        _Tracer_otTracer.set(this, void 0);
        __classPrivateFieldSet(this, _Tracer_otTracer, api_1.trace.getTracer(name, version), "f");
    }
    /**
     * Returns the underlying tracer from open telemetry that
     * could be used directly for certain advanced use-cases
     */
    getOTTracer() {
        return __classPrivateFieldGet(this, _Tracer_otTracer, "f");
    }
    /**
     * Trace a function call. Using this method will create a
     * child scope for the invocations within the callback.
     */
    trace(name, callback) {
        return __classPrivateFieldGet(this, _Tracer_otTracer, "f").startActiveSpan(name, callback);
    }
    /**
     * Returns the active context
     */
    getActiveContext() {
        return api_1.context.active();
    }
    /**
     * Returns the propagation state from the current active
     * context
     */
    getPropagationState() {
        let output = {};
        api_1.propagation.inject(api_1.context.active(), output);
        return output;
    }
    /**
     * Use the existing propogation state and trace an action. This
     * will allow the newly traced action to be part of some
     * existing trace
     */
    withPropagationState(state) {
        return {
            trace: (name, callback) => {
                const activeContext = api_1.propagation.extract(api_1.context.active(), state);
                return __classPrivateFieldGet(this, _Tracer_otTracer, "f").startActiveSpan(name, {}, activeContext, callback);
            },
        };
    }
}
exports.Tracer = Tracer;
_Tracer_otTracer = new WeakMap();
//# sourceMappingURL=index.js.map