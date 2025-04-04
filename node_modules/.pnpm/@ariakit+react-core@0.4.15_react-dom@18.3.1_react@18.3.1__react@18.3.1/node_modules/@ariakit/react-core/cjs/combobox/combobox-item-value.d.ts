import type { ElementType, ReactElement } from "react";
import type { Options, Props } from "../utils/types.ts";
import type { ComboboxStore } from "./combobox-store.ts";
declare const TagName = "span";
type TagName = typeof TagName;
/**
 * Returns props to create a `ComboboxItemValue` component that displays a value
 * element inside a combobox item. The value will be split into span elements
 * and returned as the children prop. The portions of the value that correspond
 * to the store value will have a `data-user-value` attribute. The other
 * portions will have a `data-autocomplete-value` attribute.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx
 * const store = useComboboxStore({ value: "p" });
 * const props = useComboboxItemValue({ store, value: "Apple" });
 * <Role {...props} />
 * // This will result in the following DOM:
 * <span>
 *   <span data-autocomplete-value>A</span>
 *   <span data-user-value>p</span>
 *   <span data-user-value>p</span>
 *   <span data-autocomplete-value>le</span>
 * </span>
 * ```
 */
export declare const useComboboxItemValue: import("../utils/types.ts").Hook<"span", ComboboxItemValueOptions<"span">>;
/**
 * Renders a `span` element with the combobox item value as children. The value
 * is split into span elements. Portions of the value matching the user input
 * will have a
 * [`data-user-value`](https://ariakit.org/guide/styling#data-user-value)
 * attribute, while the rest will have a
 * [`data-autocomplete-value`](https://ariakit.org/guide/styling#data-autocomplete-value)
 * attribute.
 *
 * The item value is automatically set to the value of the closest
 * [`ComboboxItem`](https://ariakit.org/reference/combobox-item) component's
 * [`value`](https://ariakit.org/reference/combobox-item#value) prop. The user
 * input value is automatically set to the combobox store's
 * [`value`](https://ariakit.org/reference/use-combobox-store#value) state. Both
 * values can be overridden by providing the
 * [`value`](https://ariakit.org/reference/combobox-item-value#value) and
 * [`userValue`](https://ariakit.org/reference/combobox-item-value#uservalue)
 * props, respectively.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx {5} "value"
 * <ComboboxProvider value="p">
 *   <Combobox />
 *   <ComboboxPopover>
 *     <ComboboxItem value="Apple">
 *       <ComboboxItemValue />
 *     </ComboboxItem>
 *   </ComboboxPopover>
 * </ComboboxProvider>
 *
 * // The Apple item will have a value element that looks like this:
 * <span>
 *   <span data-autocomplete-value>A</span>
 *   <span data-user-value>p</span>
 *   <span data-user-value>p</span>
 *   <span data-autocomplete-value>le</span>
 * </span>
 * ```
 */
export declare const ComboboxItemValue: (props: ComboboxItemValueProps) => ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface ComboboxItemValueOptions<_T extends ElementType = TagName> extends Options {
    /**
     * Object returned by the
     * [`useComboboxStore`](https://ariakit.org/reference/use-combobox-store)
     * hook. If not provided, the closest
     * [`ComboboxList`](https://ariakit.org/reference/combobox-list) or
     * [`ComboboxPopover`](https://ariakit.org/reference/combobox-popover)
     * components' context will be used.
     */
    store?: ComboboxStore;
    /**
     * The current combobox item value. If not provided, the parent
     * [`ComboboxItem`](https://ariakit.org/reference/combobox-item) component's
     * [`value`](https://ariakit.org/reference/combobox-item#value) prop will be
     * used.
     *
     * This is the value rendered by the component. It can be customized to
     * display different children.
     */
    value?: string;
    /**
     * The current user input value. If not provided, the combobox store's
     * [`value`](https://ariakit.org/reference/use-combobox-store#value) state
     * will be used.
     *
     * This is the value used to highlight the matching portions of the item
     * value. It can be customized to highlight different portions.
     */
    userValue?: string | string[];
}
export type ComboboxItemValueProps<T extends ElementType = TagName> = Props<T, ComboboxItemValueOptions<T>>;
export {};
