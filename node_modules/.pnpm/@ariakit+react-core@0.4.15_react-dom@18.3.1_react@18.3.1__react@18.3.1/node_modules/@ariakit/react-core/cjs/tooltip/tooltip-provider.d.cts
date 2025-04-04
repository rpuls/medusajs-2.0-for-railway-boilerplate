import type { ReactNode } from "react";
import type { TooltipStoreProps } from "./tooltip-store.ts";
/**
 * Provides a tooltip store to [Tooltip](https://ariakit.org/components/tooltip)
 * components.
 * @see https://ariakit.org/components/tooltip
 * @example
 * ```jsx
 * <TooltipProvider timeout={250}>
 *   <TooltipAnchor />
 *   <Tooltip />
 * </TooltipProvider>
 * ```
 */
export declare function TooltipProvider(props?: TooltipProviderProps): import("react/jsx-runtime").JSX.Element;
export interface TooltipProviderProps extends TooltipStoreProps {
    children?: ReactNode;
}
