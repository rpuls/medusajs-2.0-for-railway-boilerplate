import type { ElementType } from "react";
import type { CompositeRowOptions } from "../composite/composite-row.tsx";
import type { Props } from "../utils/types.ts";
import type { SelectStore } from "./select-store.ts";
declare const TagName = "div";
type TagName = typeof TagName;
/**
 * Returns props to create a `SelectRow` component.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const store = useSelectStore();
 * const props = useSelectRow({ store });
 * <SelectPopover store={store}>
 *   <Role {...props}>
 *     <SelectItem value="Apple" />
 *     <SelectItem value="Orange" />
 *   </Role>
 * </SelectPopover>
 * ```
 */
export declare const useSelectRow: import("../utils/types.ts").Hook<"div", SelectRowOptions<"div">>;
/**
 * Renders a select row that allows two-dimensional arrow key navigation.
 * [`SelectItem`](https://ariakit.org/reference/select-item) elements wrapped
 * within this component will automatically receive a
 * [`rowId`](https://ariakit.org/reference/select-item#rowid) prop.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx {4-11}
 * <SelectProvider>
 *   <Select />
 *   <SelectPopover>
 *     <SelectRow>
 *       <SelectItem value="Apple" />
 *       <SelectItem value="Orange" />
 *     </SelectRow>
 *     <SelectRow>
 *       <SelectItem value="Banana" />
 *       <SelectItem value="Grape" />
 *     </SelectRow>
 *   </SelectPopover>
 * </SelectProvider>
 * ```
 */
export declare const SelectRow: (props: SelectRowProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface SelectRowOptions<T extends ElementType = TagName> extends CompositeRowOptions<T> {
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
export type SelectRowProps<T extends ElementType = TagName> = Props<T, SelectRowOptions<T>>;
export {};
