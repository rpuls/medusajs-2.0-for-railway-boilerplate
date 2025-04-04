import type { ElementType } from "react";
import type { CompositeSeparatorOptions } from "../composite/composite-separator.tsx";
import type { Props } from "../utils/types.ts";
import type { ToolbarStore } from "./toolbar-store.ts";
declare const TagName = "hr";
type TagName = typeof TagName;
/**
 * Returns props to create a `ToolbarSeparator` component.
 * @see https://ariakit.org/components/toolbar
 * @example
 * ```jsx
 * const store = useToolbarStore();
 * const props = useToolbarSeparator({ store });
 * <Toolbar store={store}>
 *   <ToolbarItem>Item 1</ToolbarItem>
 *   <Role {...props} />
 *   <ToolbarItem>Item 2</ToolbarItem>
 * </Toolbar>
 * ```
 */
export declare const useToolbarSeparator: import("../utils/types.ts").Hook<"hr", ToolbarSeparatorOptions<"hr">>;
/**
 * Renders a divider between
 * [`ToolbarItem`](https://ariakit.org/reference/toolbar-item) elements.
 * @see https://ariakit.org/components/toolbar
 * @example
 * ```jsx {3}
 * <Toolbar>
 *   <ToolbarItem>Item 1</ToolbarItem>
 *   <ToolbarSeparator />
 *   <ToolbarItem>Item 2</ToolbarItem>
 * </Toolbar>
 * ```
 */
export declare const ToolbarSeparator: (props: ToolbarSeparatorProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface ToolbarSeparatorOptions<T extends ElementType = TagName> extends CompositeSeparatorOptions<T> {
    /**
     * Object returned by the
     * [`useToolbarStore`](https://ariakit.org/reference/use-toolbar-store) hook.
     * If not provided, the closest
     * [`Toolbar`](https://ariakit.org/reference/toolbar) component's context will
     * be used.
     */
    store?: ToolbarStore;
}
export type ToolbarSeparatorProps<T extends ElementType = TagName> = Props<T, ToolbarSeparatorOptions<T>>;
export {};
