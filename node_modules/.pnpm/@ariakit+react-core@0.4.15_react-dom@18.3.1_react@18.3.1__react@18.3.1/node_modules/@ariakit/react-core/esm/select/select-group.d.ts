import type { ElementType } from "react";
import type { CompositeGroupOptions } from "../composite/composite-group.tsx";
import type { Props } from "../utils/types.ts";
import type { SelectStore } from "./select-store.ts";
declare const TagName = "div";
type TagName = typeof TagName;
/**
 * Returns props to create a `SelectGroup` component.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const store = useSelectStore();
 * const props = useSelectGroup({ store });
 * <Select store={store} />
 * <SelectPopover store={store}>
 *   <Role {...props}>
 *     <SelectGroupLabel>Fruits</SelectGroupLabel>
 *     <SelectItem value="Apple" />
 *     <SelectItem value="Orange" />
 *   </Role>
 * </SelectPopover>
 * ```
 */
export declare const useSelectGroup: import("../utils/types.ts").Hook<"div", SelectGroupOptions<"div">>;
/**
 * Renders a group for [`SelectItem`](https://ariakit.org/reference/select-item)
 * elements. Optionally, a
 * [`SelectGroupLabel`](https://ariakit.org/reference/select-group-label) can be
 * rendered as a child to provide a label for the group.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx {4-8}
 * <SelectProvider>
 *   <Select />
 *   <SelectPopover>
 *     <SelectGroup>
 *       <SelectGroupLabel>Fruits</SelectGroupLabel>
 *       <SelectItem value="Apple" />
 *       <SelectItem value="Orange" />
 *     </SelectGroup>
 *   </SelectPopover>
 * </SelectProvider>
 * ```
 */
export declare const SelectGroup: (props: SelectGroupProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface SelectGroupOptions<T extends ElementType = TagName> extends CompositeGroupOptions<T> {
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
export type SelectGroupProps<T extends ElementType = TagName> = Props<T, SelectGroupOptions<T>>;
export {};
