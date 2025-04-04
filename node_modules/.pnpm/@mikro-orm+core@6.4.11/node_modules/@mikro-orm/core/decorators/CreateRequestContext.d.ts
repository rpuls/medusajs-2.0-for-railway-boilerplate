import type { ContextProvider } from '../typings';
export declare function CreateRequestContext<T extends object>(context?: ContextProvider<T>, respectExistingContext?: boolean): MethodDecorator;
export declare function EnsureRequestContext<T extends object>(context?: ContextProvider<T>): MethodDecorator;
