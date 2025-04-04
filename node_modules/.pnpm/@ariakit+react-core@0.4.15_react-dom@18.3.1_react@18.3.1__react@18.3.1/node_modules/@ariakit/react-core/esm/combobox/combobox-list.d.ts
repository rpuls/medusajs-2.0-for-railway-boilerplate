import type { ElementType } from "react";
import type { DisclosureContentOptions } from "../disclosure/disclosure-content.tsx";
import type { Options, Props } from "../utils/types.ts";
import type { ComboboxStore } from "./combobox-store.ts";
declare const TagName = "div";
type TagName = typeof TagName;
/**
 * Returns props to create a `ComboboxList` component.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx
 * const store = useComboboxStore();
 * const props = useComboboxList({ store });
 * <Role {...props}>
 *   <ComboboxItem value="Item 1" />
 *   <ComboboxItem value="Item 2" />
 *   <ComboboxItem value="Item 3" />
 * </Role>
 * ```
 */
export declare const useComboboxList: import("../utils/types.ts").Hook<"div", ComboboxListOptions<"div">>;
/**
 * Renders a combobox list. The `role` prop is set to `listbox` by default, but
 * can be overriden by any other valid combobox popup role (`listbox`, `menu`,
 * `tree`, `grid` or `dialog`).
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx {3-7}
 * <ComboboxProvider>
 *   <Combobox />
 *   <ComboboxList>
 *     <ComboboxItem value="Apple" />
 *     <ComboboxItem value="Banana" />
 *     <ComboboxItem value="Orange" />
 *   </ComboboxList>
 * </ComboboxProvider>
 * ```
 */
export declare const ComboboxList: (props: ComboboxListProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface ComboboxListOptions<T extends ElementType = TagName> extends Options, Pick<DisclosureContentOptions<T>, "alwaysVisible"> {
    /**
     * Object returned by the
     * [`useComboboxStore`](https://ariakit.org/reference/use-combobox-store)
     * hook. If not provided, the closest
     * [`ComboboxProvider`](https://ariakit.org/reference/combobox-provider)
     * component's context will be used.
     */
    store?: ComboboxStore;
}
export type ComboboxListProps<T extends ElementType = TagName> = Props<T, ComboboxListOptions<T>>;
export {};
