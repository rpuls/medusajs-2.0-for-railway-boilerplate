"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultLogger = void 0;
const colors_1 = require("./colors");
class DefaultLogger {
    options;
    debugMode;
    writer;
    usesReplicas;
    highlighter;
    constructor(options) {
        this.options = options;
        this.debugMode = this.options.debugMode ?? false;
        this.writer = this.options.writer;
        this.usesReplicas = this.options.usesReplicas;
        this.highlighter = this.options.highlighter;
    }
    /**
     * @inheritDoc
     */
    log(namespace, message, context) {
        if (!this.isEnabled(namespace, context)) {
            return;
        }
        // clean up the whitespace
        message = message.replace(/\n/g, '').replace(/ +/g, ' ').trim();
        // use red for error levels
        if (context?.level === 'error') {
            message = colors_1.colors.red(message);
        }
        // use yellow for warning levels
        if (context?.level === 'warning') {
            message = colors_1.colors.yellow(message);
        }
        const label = context?.label
            ? colors_1.colors.cyan(`(${context.label}) `)
            : '';
        this.writer(colors_1.colors.grey(`[${namespace}] `) + label + message);
    }
    /**
     * @inheritDoc
     */
    error(namespace, message, context) {
        this.log(namespace, message, { ...context, level: 'error' });
    }
    /**
     * @inheritDoc
     */
    warn(namespace, message, context) {
        this.log(namespace, message, { ...context, level: 'warning' });
    }
    /**
     * @inheritDoc
     */
    setDebugMode(debugMode) {
        this.debugMode = debugMode;
    }
    isEnabled(namespace, context) {
        if (context?.enabled !== undefined) {
            return context.enabled;
        }
        const debugMode = context?.debugMode ?? this.debugMode;
        if (namespace === 'deprecated') {
            const { ignoreDeprecations = false } = this.options;
            return Array.isArray(ignoreDeprecations)
                ? !ignoreDeprecations.includes(context?.label ?? '')
                : !ignoreDeprecations;
        }
        return !!debugMode && (!Array.isArray(debugMode) || debugMode.includes(namespace));
    }
    /**
     * @inheritDoc
     */
    logQuery(context) {
        if (!this.isEnabled('query', context)) {
            return;
        }
        /* istanbul ignore next */
        let msg = this.highlighter?.highlight(context.query) ?? context.query;
        if (context.took != null) {
            const meta = [`took ${context.took} ms`];
            if (context.results != null) {
                meta.push(`${context.results} result${context.results === 0 || context.results > 1 ? 's' : ''}`);
            }
            if (context.affected != null) {
                meta.push(`${context.affected} row${context.affected === 0 || context.affected > 1 ? 's' : ''} affected`);
            }
            msg += colors_1.colors.grey(` [${meta.join(', ')}]`);
        }
        if (this.usesReplicas && context.connection) {
            msg += colors_1.colors.cyan(` (via ${context.connection.type} connection '${context.connection.name}')`);
        }
        return this.log('query', msg, context);
    }
    static create(options) {
        return new DefaultLogger(options);
    }
}
exports.DefaultLogger = DefaultLogger;
