import type { ElementType } from "react";
import type { CheckboxCheckOptions } from "../checkbox/checkbox-check.tsx";
import type { Props } from "../utils/types.ts";
import type { ComboboxStore } from "./combobox-store.ts";
declare const TagName = "span";
type TagName = typeof TagName;
/**
 * Returns props to create a `ComboboxItemCheck` component. This hook must be
 * used in a component that's wrapped with `ComboboxItem` or the `checked` prop
 * must be explicitly passed to the component.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx
 * const props = useComboboxItemCheck({ checked: true });
 * <Role {...props} />
 * ```
 */
export declare const useComboboxItemCheck: import("../utils/types.ts").Hook<"span", ComboboxItemCheckOptions<"span">>;
/**
 * Renders a checkmark icon when the
 * [`checked`](https://ariakit.org/reference/combobox-item-check#checked) prop
 * is `true`. The icon can be overridden by providing a different one as
 * children.
 *
 * When rendered inside a
 * [`ComboboxItem`](https://ariakit.org/reference/combobox-item) component, the
 * [`checked`](https://ariakit.org/reference/combobox-item-check#checked) prop
 * is automatically derived from the context.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx {5,9}
 * <ComboboxProvider>
 *   <Combobox />
 *   <ComboboxPopover>
 *     <ComboboxItem value="Apple">
 *       <ComboboxItemCheck />
 *       Apple
 *     </ComboboxItem>
 *     <ComboboxItem value="Orange">
 *       <ComboboxItemCheck />
 *       Orange
 *     </ComboboxItem>
 *   </ComboboxPopover>
 * </ComboboxProvider>
 * ```
 */
export declare const ComboboxItemCheck: (props: ComboboxItemCheckProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface ComboboxItemCheckOptions<T extends ElementType = TagName> extends CheckboxCheckOptions<T> {
    /**
     * Object returned by the
     * [`useComboboxStore`](https://ariakit.org/reference/use-combobox-store)
     * hook.
     */
    store?: ComboboxStore;
}
export type ComboboxItemCheckProps<T extends ElementType = TagName> = Props<T, ComboboxItemCheckOptions<T>>;
export {};
