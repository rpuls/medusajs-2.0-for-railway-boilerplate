import type { ElementType } from "react";
import type { DialogDisclosureOptions } from "../dialog/dialog-disclosure.tsx";
import type { Props } from "../utils/types.ts";
import type { ComboboxStore } from "./combobox-store.ts";
declare const TagName = "button";
type TagName = typeof TagName;
/**
 * Returns props to create a `ComboboxDisclosure` component that toggles the
 * combobox popover visibility when clicked.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx
 * const store = useComboboxStore();
 * const props = useComboboxDisclosure({ store });
 * <Combobox store={store} />
 * <Role {...props} />
 * <ComboboxPopover store={store}>
 *   <ComboboxItem value="Item 1" />
 *   <ComboboxItem value="Item 2" />
 *   <ComboboxItem value="Item 3" />
 * </ComboboxPopover>
 * ```
 */
export declare const useComboboxDisclosure: import("../utils/types.ts").Hook<"button", ComboboxDisclosureOptions<"button">>;
/**
 * Renders a combobox disclosure button that toggles the
 * [`ComboboxPopover`](https://ariakit.org/reference/combobox-popover) element's
 * visibility when clicked.
 *
 * Although this button is not tabbable, it remains accessible to screen reader
 * users. On clicking, it automatically shifts focus to the
 * [`Combobox`](https://ariakit.org/reference/combobox) element.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx {3}
 * <ComboboxProvider>
 *   <Combobox />
 *   <ComboboxDisclosure />
 *   <ComboboxPopover>
 *     <ComboboxItem value="Apple" />
 *     <ComboboxItem value="Banana" />
 *     <ComboboxItem value="Orange" />
 *   </ComboboxPopover>
 * </ComboboxProvider>
 * ```
 */
export declare const ComboboxDisclosure: (props: ComboboxDisclosureProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface ComboboxDisclosureOptions<T extends ElementType = TagName> extends DialogDisclosureOptions<T> {
    /**
     * Object returned by the
     * [`useComboboxStore`](https://ariakit.org/reference/use-combobox-store)
     * hook. If not provided, the closest
     * [`ComboboxProvider`](https://ariakit.org/reference/combobox-provider)
     * component's context will be used.
     */
    store?: ComboboxStore;
}
export type ComboboxDisclosureProps<T extends ElementType = TagName> = Props<T, ComboboxDisclosureOptions<T>>;
export {};
