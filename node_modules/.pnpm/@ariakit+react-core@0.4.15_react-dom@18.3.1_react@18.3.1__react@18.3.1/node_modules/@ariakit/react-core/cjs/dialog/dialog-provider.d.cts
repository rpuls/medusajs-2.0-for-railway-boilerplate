import type { ReactNode } from "react";
import type { DialogStoreProps } from "./dialog-store.ts";
/**
 * Provides a dialog store to [Dialog](https://ariakit.org/components/dialog)
 * components.
 * @see https://ariakit.org/components/dialog
 * @example
 * ```jsx
 * <DialogProvider>
 *   <Dialog />
 * </DialogProvider>
 * ```
 */
export declare function DialogProvider(props?: DialogProviderProps): import("react/jsx-runtime").JSX.Element;
export interface DialogProviderProps extends DialogStoreProps {
    children?: ReactNode;
}
