import type { ElementType } from "react";
import type { Options, Props } from "../utils/types.ts";
import type { ComboboxStore } from "./combobox-store.ts";
declare const TagName = "label";
type TagName = typeof TagName;
/**
 * Returns props to create a `ComboboxLabel` component.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx
 * const store = useComboboxStore();
 * const props = useComboboxLabel({ store });
 * <Role {...props}>Favorite fruit</Role>
 * <Combobox store={store} />
 * ```
 */
export declare const useComboboxLabel: import("../utils/types.ts").Hook<"label", ComboboxLabelOptions<"label">>;
/**
 * Renders a label for the [`Combobox`](https://ariakit.org/reference/combobox)
 * component.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx {2}
 * <ComboboxProvider>
 *   <ComboboxLabel>Favorite fruit</ComboboxLabel>
 *   <Combobox />
 *   <ComboboxPopover>
 *     <ComboboxItem value="Apple" />
 *     <ComboboxItem value="Orange" />
 *   </ComboboxPopover>
 * </ComboboxProvider>
 * ```
 */
export declare const ComboboxLabel: (props: ComboboxLabelProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface ComboboxLabelOptions<_T extends ElementType = TagName> extends Options {
    /**
     * Object returned by the
     * [`useComboboxStore`](https://ariakit.org/reference/use-combobox-store)
     * hook. If not provided, the closest
     * [`ComboboxProvider`](https://ariakit.org/reference/combobox-provider)
     * component's context will be used.
     */
    store?: ComboboxStore;
}
export type ComboboxLabelProps<T extends ElementType = TagName> = Props<T, ComboboxLabelOptions<T>>;
export {};
