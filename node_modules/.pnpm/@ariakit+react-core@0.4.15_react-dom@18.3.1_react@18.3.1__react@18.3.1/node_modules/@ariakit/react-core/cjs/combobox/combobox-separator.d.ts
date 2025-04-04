import type { ElementType } from "react";
import type { CompositeSeparatorOptions } from "../composite/composite-separator.tsx";
import type { Props } from "../utils/types.ts";
import type { ComboboxStore } from "./combobox-store.ts";
declare const TagName = "hr";
type TagName = typeof TagName;
/**
 * Returns props a `ComboboxSeparator` component for combobox items.
 * @deprecated Use `useComboboxGroup` with CSS borders instead.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx
 * const store = useComboboxStore();
 * const props = useComboboxSeparator({ store });
 * <ComboboxPopover store={store}>
 *   <ComboboxItem value="Item 1" />
 *   <Role {...props} />
 *   <ComboboxItem value="Item 2" />
 *   <ComboboxItem value="Item 3" />
 * </ComboboxPopover>
 * ```
 */
export declare const useComboboxSeparator: import("../utils/types.ts").Hook<"hr", ComboboxSeparatorOptions<"hr">>;
/**
 * Renders a divider between
 * [`ComboboxItem`](https://ariakit.org/reference/combobox-item) elements.
 * @deprecated Use
 * [`ComboboxGroup`](https://ariakit.org/reference/combobox-group) with CSS
 * borders instead.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx {5}
 * <ComboboxProvider>
 *   <Combobox />
 *   <ComboboxPopover>
 *     <ComboboxItem value="Item 1" />
 *     <ComboboxSeparator />
 *     <ComboboxItem value="Item 2" />
 *     <ComboboxItem value="Item 3" />
 *   </ComboboxPopover>
 * </ComboboxProvider>
 * ```
 */
export declare const ComboboxSeparator: (props: ComboboxSeparatorProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface ComboboxSeparatorOptions<T extends ElementType = TagName> extends CompositeSeparatorOptions<T> {
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
export type ComboboxSeparatorProps<T extends ElementType = TagName> = Props<T, ComboboxSeparatorOptions<T>>;
export {};
