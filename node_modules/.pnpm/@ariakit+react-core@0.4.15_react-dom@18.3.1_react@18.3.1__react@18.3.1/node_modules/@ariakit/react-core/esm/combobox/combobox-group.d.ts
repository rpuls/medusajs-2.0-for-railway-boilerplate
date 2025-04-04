import type { ElementType } from "react";
import type { CompositeGroupOptions } from "../composite/composite-group.tsx";
import type { Props } from "../utils/types.ts";
import type { ComboboxStore } from "./combobox-store.ts";
declare const TagName = "div";
type TagName = typeof TagName;
/**
 * Returns props to create a `ComboboxGroup` component.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx
 * const store = useComboboxStore();
 * const props = useComboboxGroup({ store });
 * <Combobox store={store} />
 * <ComboboxPopover store={store}>
 *   <Role {...props}>
 *     <ComboboxGroupLabel>Label</ComboboxGroupLabel>
 *     <ComboboxItem value="Item 1" />
 *     <ComboboxItem value="Item 2" />
 *   </Role>
 * </ComboboxPopover>
 * ```
 */
export declare const useComboboxGroup: import("../utils/types.ts").Hook<"div", ComboboxGroupOptions<"div">>;
/**
 * Renders a group for
 * [`ComboboxItem`](https://ariakit.org/reference/combobox-item) elements.
 * Optionally, a
 * [`ComboboxGroupLabel`](https://ariakit.org/reference/combobox-group-label)
 * can be rendered as a child to provide a label for the group.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx {4-8}
 * <ComboboxProvider>
 *   <Combobox />
 *   <ComboboxPopover>
 *     <ComboboxGroup>
 *       <ComboboxGroupLabel>Fruits</ComboboxGroupLabel>
 *       <ComboboxItem value="Apple" />
 *       <ComboboxItem value="Banana" />
 *     </ComboboxGroup>
 *   </ComboboxPopover>
 * </ComboboxProvider>
 * ```
 */
export declare const ComboboxGroup: (props: ComboboxGroupProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface ComboboxGroupOptions<T extends ElementType = TagName> extends CompositeGroupOptions<T> {
    /**
     * Object returned by the
     * [`useComboboxStore`](https://ariakit.org/reference/use-combobox-store)
     * hook. If not provided, the closest
     * [`ComboboxList`](https://ariakit.org/reference/combobox-list) or
     * [`ComboboxPopover`](https://ariakit.org/reference/combobox-popover)
     * components' context will be used.
     */
    store?: ComboboxStore;
}
export type ComboboxGroupProps<T extends ElementType = TagName> = Props<T, ComboboxGroupOptions<T>>;
export {};
