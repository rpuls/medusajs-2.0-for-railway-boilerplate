import type { ReactNode } from "react";
import type { PopoverStoreProps } from "./popover-store.ts";
/**
 * Provides a popover store to [Popover](https://ariakit.org/components/popover)
 * components.
 * @see https://ariakit.org/components/popover
 * @example
 * ```jsx
 * <PopoverProvider>
 *   <PopoverDisclosure />
 *   <Popover />
 * </PopoverProvider>
 * ```
 */
export declare function PopoverProvider(props?: PopoverProviderProps): import("react/jsx-runtime").JSX.Element;
export interface PopoverProviderProps extends PopoverStoreProps {
    children?: ReactNode;
}
