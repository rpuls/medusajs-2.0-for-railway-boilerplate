import type { ElementType } from "react";
import type { CompositeItemOptions } from "../composite/composite-item.tsx";
import type { Props } from "../utils/types.ts";
import type { ToolbarStore } from "./toolbar-store.ts";
declare const TagName = "button";
type TagName = typeof TagName;
/**
 * Returns props to create a `ToolbarItem` component.
 * @see https://ariakit.org/components/toolbar
 * @example
 * ```jsx
 * const store = useToolbarStore();
 * const props = useToolbarItem({ store });
 * <Toolbar store={store}>
 *   <Role {...props}>Item</Role>
 * </Toolbar>
 * ```
 */
export declare const useToolbarItem: import("../utils/types.ts").Hook<"button", ToolbarItemOptions<"button">>;
/**
 * Renders an interactive element inside a
 * [`Toolbar`](https://ariakit.org/reference/toolbar).
 * @see https://ariakit.org/components/toolbar
 * @example
 * ```jsx {2}
 * <Toolbar>
 *   <ToolbarItem>Item</ToolbarItem>
 * </Toolbar>
 * ```
 */
export declare const ToolbarItem: (props: ToolbarItemProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface ToolbarItemOptions<T extends ElementType = TagName> extends CompositeItemOptions<T> {
    /**
     * Object returned by the
     * [`useToolbarStore`](https://ariakit.org/reference/use-toolbar-store) hook.
     * If not provided, the closest
     * [`Toolbar`](https://ariakit.org/reference/toolbar) component's context will
     * be used.
     */
    store?: ToolbarStore;
}
export type ToolbarItemProps<T extends ElementType = TagName> = Props<T, ToolbarItemOptions<T>>;
export {};
