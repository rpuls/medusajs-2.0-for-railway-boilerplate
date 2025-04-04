"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleLogger = void 0;
const DefaultLogger_1 = require("./DefaultLogger");
/**
 * A basic logger that provides fully formatted output without color
 */
class SimpleLogger extends DefaultLogger_1.DefaultLogger {
    /**
     * @inheritDoc
     */
    log(namespace, message, context) {
        if (!this.isEnabled(namespace, context)) {
            return;
        }
        // clean up the whitespace
        message = message.replace(/\n/g, '').replace(/ +/g, ' ').trim();
        const label = context?.label ? `(${context.label}) ` : '';
        this.writer(`[${namespace}] ${label}${message}`);
    }
    /**
     * @inheritDoc
     */
    logQuery(context) {
        if (!this.isEnabled('query', context)) {
            return;
        }
        return this.log('query', context.query, context);
    }
    static create(options) {
        return new SimpleLogger(options);
    }
}
exports.SimpleLogger = SimpleLogger;
