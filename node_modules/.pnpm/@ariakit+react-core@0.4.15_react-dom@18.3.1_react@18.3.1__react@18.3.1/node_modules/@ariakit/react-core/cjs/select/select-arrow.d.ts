import type { ElementType } from "react";
import type { PopoverDisclosureArrowOptions } from "../popover/popover-disclosure-arrow.tsx";
import type { Props } from "../utils/types.ts";
import type { SelectStore } from "./select-store.ts";
declare const TagName = "span";
type TagName = typeof TagName;
/**
 * Returns props to create a `SelectArrow` component.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const store = useSelectStore();
 * const props = useSelectArrow({ store });
 * <Select store={store}>
 *   {store.value}
 *   <Role {...props} />
 * </Select>
 * <SelectPopover store={store}>
 *   <SelectItem value="Apple" />
 *   <SelectItem value="Orange" />
 * </SelectPopover>
 * ```
 */
export declare const useSelectArrow: import("../utils/types.ts").Hook<"span", SelectArrowOptions<"span">>;
/**
 * Renders an arrow pointing to the select popover position. It's usually
 * rendered inside the [`Select`](https://ariakit.org/reference/select)
 * component.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx {4}
 * <SelectProvider>
 *   <Select>
 *     {select.value}
 *     <SelectArrow />
 *   </Select>
 *   <SelectPopover>
 *     <SelectItem value="Apple" />
 *     <SelectItem value="Orange" />
 *   </SelectPopover>
 * </SelectProvider>
 * ```
 */
export declare const SelectArrow: (props: SelectArrowProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface SelectArrowOptions<T extends ElementType = TagName> extends PopoverDisclosureArrowOptions<T> {
    /**
     * Object returned by the
     * [`useSelectStore`](https://ariakit.org/reference/use-select-store) hook. If
     * not provided, the closest [`Select`](https://ariakit.org/reference/select)
     * or [`SelectProvider`](https://ariakit.org/reference/select-provider)
     * components' context will be used.
     */
    store?: SelectStore;
}
export type SelectArrowProps<T extends ElementType = TagName> = Props<T, SelectArrowOptions<T>>;
export {};
