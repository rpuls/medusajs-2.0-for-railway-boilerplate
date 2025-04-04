import type { TransactionOptions } from '../enums';
import type { ContextProvider } from '../typings';
type TransactionalOptions<T> = TransactionOptions & {
    context?: ContextProvider<T>;
};
/**
 * This decorator wraps the method with `em.transactional()`, so you can provide `TransactionOptions` just like with `em.transactional()`.
 * The difference is that you can specify the context in which the transaction begins by providing `context` option,
 * and if omitted, the transaction will begin in the current context implicitly.
 * It works on async functions and can be nested with `em.transactional()`.
 */
export declare function Transactional<T extends object>(options?: TransactionalOptions<T>): MethodDecorator;
export {};
