import * as React from "react";
import type { ToastAction, ToastVariant } from "../../types";
interface ToastComponentProps {
    id: string | number;
    variant?: ToastVariant;
    title: React.ReactNode;
    description?: React.ReactNode;
    action?: ToastAction;
    icon?: React.ReactNode;
    dismissable?: boolean;
}
/**
 * This component is based on the [Sonner](https://sonner.emilkowal.ski/toast) toast library.
 */
export declare const Toast: ({ id, variant, title, icon: _icon, description, action, dismissable, }: ToastComponentProps) => React.JSX.Element;
export {};
//# sourceMappingURL=toast.d.ts.map