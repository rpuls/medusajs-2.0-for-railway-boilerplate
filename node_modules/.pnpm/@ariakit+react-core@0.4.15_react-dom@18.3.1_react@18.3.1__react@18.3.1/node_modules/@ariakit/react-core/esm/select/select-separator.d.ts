import type { ElementType } from "react";
import type { CompositeSeparatorOptions } from "../composite/composite-separator.tsx";
import type { Props } from "../utils/types.ts";
import type { SelectStore } from "./select-store.ts";
declare const TagName = "hr";
type TagName = typeof TagName;
/**
 * Returns props to create a `SelectSeparator` component.
 * @deprecated Use `useSelectGroup` with CSS borders instead.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const store = useSelectStore();
 * const props = useSelectSeparator({ store });
 * <SelectPopover store={store}>
 *   <SelectItem value="Item 1" />
 *   <Role {...props} />
 *   <SelectItem value="Item 2" />
 *   <SelectItem value="Item 3" />
 * </SelectPopover>
 * ```
 */
export declare const useSelectSeparator: import("../utils/types.ts").Hook<"hr", SelectSeparatorOptions<"hr">>;
/**
 * Renders a divider between
 * [`SelectItem`](https://ariakit.org/reference/select-item) elements.
 * @deprecated Use [`SelectGroup`](https://ariakit.org/reference/select-group)
 * with CSS borders instead.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx {5}
 * <SelectProvider>
 *   <Select />
 *   <SelectPopover>
 *     <SelectItem value="Item 1" />
 *     <SelectSeparator />
 *     <SelectItem value="Item 2" />
 *     <SelectItem value="Item 3" />
 *   </SelectPopover>
 * </SelectProvider>
 * ```
 */
export declare const SelectSeparator: (props: SelectSeparatorProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface SelectSeparatorOptions<T extends ElementType = TagName> extends CompositeSeparatorOptions<T> {
    /**
     * Object returned by the
     * [`useSelectStore`](https://ariakit.org/reference/use-select-store) hook. If
     * not provided, the parent
     * [`SelectList`](https://ariakit.org/reference/select-list) or
     * [`SelectPopover`](https://ariakit.org/reference/select-popover) components'
     * context will be used.
     */
    store?: SelectStore;
}
export type SelectSeparatorProps<T extends ElementType = TagName> = Props<T, SelectSeparatorOptions<T>>;
export {};
