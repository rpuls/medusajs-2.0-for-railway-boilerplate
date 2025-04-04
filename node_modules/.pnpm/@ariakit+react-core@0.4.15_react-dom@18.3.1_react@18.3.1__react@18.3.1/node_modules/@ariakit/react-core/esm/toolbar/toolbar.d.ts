import type { ElementType } from "react";
import type { CompositeOptions } from "../composite/composite.tsx";
import type { Props } from "../utils/types.ts";
import type { ToolbarStore, ToolbarStoreProps } from "./toolbar-store.ts";
declare const TagName = "div";
type TagName = typeof TagName;
/**
 * Returns props to create a `Toolbar` component.
 * @see https://ariakit.org/components/toolbar
 * @example
 * ```jsx
 * const store = useToolbarStore();
 * const props = useToolbar({ store });
 * <Role {...props}>
 *   <ToolbarItem>Item 1</ToolbarItem>
 *   <ToolbarItem>Item 2</ToolbarItem>
 * </Role>
 * ```
 */
export declare const useToolbar: import("../utils/types.ts").Hook<"div", ToolbarOptions<"div">>;
/**
 * Renders a toolbar element that groups interactive elements together.
 * @see https://ariakit.org/components/toolbar
 * @example
 * ```jsx
 * <Toolbar>
 *   <ToolbarItem>Item 1</ToolbarItem>
 *   <ToolbarItem>Item 2</ToolbarItem>
 * </Toolbar>
 * ```
 */
export declare const Toolbar: (props: ToolbarProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface ToolbarOptions<T extends ElementType = TagName> extends CompositeOptions<T>, Pick<ToolbarStoreProps, "focusLoop" | "orientation" | "rtl" | "virtualFocus"> {
    /**
     * Object returned by the
     * [`useToolbarStore`](https://ariakit.org/reference/use-toolbar-store) hook.
     * If not provided, the closest
     * [`ToolbarProvider`](https://ariakit.org/reference/toolbar-provider)
     * component context will be used. If the component is not wrapped in a
     * [`ToolbarProvider`](https://ariakit.org/reference/toolbar-provider)
     * component, an internal store will be used.
     */
    store?: ToolbarStore;
}
export type ToolbarProps<T extends ElementType = TagName> = Props<T, ToolbarOptions<T>>;
export {};
