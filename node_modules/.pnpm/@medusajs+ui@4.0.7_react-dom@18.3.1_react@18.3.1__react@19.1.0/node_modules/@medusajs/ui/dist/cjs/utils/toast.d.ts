import { ToastAction, ToasterPosition } from "../types";
import * as React from "react";
interface BaseToastProps {
    id?: string | number;
    position?: ToasterPosition;
    duration?: number;
    dismissable?: boolean;
    icon?: React.ReactNode;
}
interface ToastProps extends BaseToastProps {
    description?: React.ReactNode;
    action?: ToastAction;
}
declare function message(
/**
 * The title of the toast.
 */
title: string, 
/**
 * The props of the toast.
 */
props?: ToastProps): string | number;
interface VariantToastProps extends Omit<ToastProps, "icon"> {
}
declare function info(
/**
 * The title of the toast.
 */ title: string, 
/**
 * The props of the toast.
 */
props?: VariantToastProps): string | number;
declare function error(
/**
 * The title of the toast.
 */ title: string, 
/**
 * The props of the toast.
 */
props?: VariantToastProps): string | number;
declare function success(
/**
 * The title of the toast.
 */ title: string, 
/**
 * The props of the toast.
 */
props?: VariantToastProps): string | number;
declare function warning(
/**
 * The title of the toast.
 */ title: string, 
/**
 * The props of the toast.
 */
props?: VariantToastProps): string | number;
declare function loading(
/**
 * The title of the toast.
 */ title: string, 
/**
 * The props of the toast.
 */
props?: VariantToastProps): string | number;
type PromiseStateProps = string | {
    title: string;
    description?: string;
};
interface PromiseToastProps extends Omit<BaseToastProps, "icon"> {
    loading: PromiseStateProps;
    success: PromiseStateProps;
    error: PromiseStateProps;
}
declare function promise<TData>(
/**
 * The promise to be resolved.
 */
promise: Promise<TData> | (() => Promise<TData>), 
/**
 * The props of the toast.
 */
props: PromiseToastProps): Promise<string | number>;
export declare const toast: typeof message & {
    info: typeof info;
    error: typeof error;
    warning: typeof warning;
    success: typeof success;
    promise: typeof promise;
    loading: typeof loading;
    dismiss: (id?: string | number | undefined) => string | number;
};
export {};
//# sourceMappingURL=toast.d.ts.map