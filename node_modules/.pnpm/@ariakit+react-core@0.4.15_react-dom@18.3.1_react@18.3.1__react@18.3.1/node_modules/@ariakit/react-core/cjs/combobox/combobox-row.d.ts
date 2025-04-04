import type { ElementType } from "react";
import type { CompositeRowOptions } from "../composite/composite-row.tsx";
import type { Props } from "../utils/types.ts";
import type { ComboboxStore } from "./combobox-store.ts";
declare const TagName = "div";
type TagName = typeof TagName;
/**
 * Returns props to create a `ComboboxRow` component.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx
 * const store = useComboboxStore();
 * const props = useComboboxRow({ store });
 * <ComboboxPopover store={store}>
 *   <Role {...props}>
 *     <ComboboxItem value="Item 1" />
 *     <ComboboxItem value="Item 2" />
 *     <ComboboxItem value="Item 3" />
 *   </Role>
 * </ComboboxPopover>
 * ```
 */
export declare const useComboboxRow: import("../utils/types.ts").Hook<"div", ComboboxRowOptions<"div">>;
/**
 * Renders a combobox row that allows two-dimensional arrow key navigation.
 * [`ComboboxItem`](https://ariakit.org/reference/combobox-item) elements
 * wrapped within this component will automatically receive a
 * [`rowId`](https://ariakit.org/reference/combobox-item#rowid) prop.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx {4-13}
 * <ComboboxProvider>
 *   <Combobox />
 *   <ComboboxPopover>
 *     <ComboboxRow>
 *       <ComboboxItem value="Item 1.1" />
 *       <ComboboxItem value="Item 1.2" />
 *       <ComboboxItem value="Item 1.3" />
 *     </ComboboxRow>
 *     <ComboboxRow>
 *       <ComboboxItem value="Item 2.1" />
 *       <ComboboxItem value="Item 2.2" />
 *       <ComboboxItem value="Item 2.3" />
 *     </ComboboxRow>
 *   </ComboboxPopover>
 * </ComboboxProvider>
 * ```
 */
export declare const ComboboxRow: (props: ComboboxRowProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface ComboboxRowOptions<T extends ElementType = TagName> extends CompositeRowOptions<T> {
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
export type ComboboxRowProps<T extends ElementType = TagName> = Props<T, ComboboxRowOptions<T>>;
export {};
