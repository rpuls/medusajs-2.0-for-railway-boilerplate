import type { LogContext, LoggerNamespace, LoggerOptions } from './Logger';
import { DefaultLogger } from './DefaultLogger';
/**
 * A basic logger that provides fully formatted output without color
 */
export declare class SimpleLogger extends DefaultLogger {
    /**
     * @inheritDoc
     */
    log(namespace: LoggerNamespace, message: string, context?: LogContext): void;
    /**
     * @inheritDoc
     */
    logQuery(context: {
        query: string;
    } & LogContext): void;
    static create(options: LoggerOptions): SimpleLogger;
}
