import type { ReactNode } from "react";
import type { ToolbarStoreProps } from "./toolbar-store.ts";
/**
 * Provides a toolbar store to [Toolbar](https://ariakit.org/components/toolbar)
 * components.
 * @see https://ariakit.org/components/toolbar
 * @example
 * ```jsx
 * <ToolbarProvider>
 *   <Toolbar>
 *     <ToolbarItem />
 *     <ToolbarItem />
 *     <ToolbarItem />
 *   </Toolbar>
 * </ToolbarProvider>
 * ```
 */
export declare function ToolbarProvider(props?: ToolbarProviderProps): import("react/jsx-runtime").JSX.Element;
export interface ToolbarProviderProps extends ToolbarStoreProps {
    children?: ReactNode;
}
