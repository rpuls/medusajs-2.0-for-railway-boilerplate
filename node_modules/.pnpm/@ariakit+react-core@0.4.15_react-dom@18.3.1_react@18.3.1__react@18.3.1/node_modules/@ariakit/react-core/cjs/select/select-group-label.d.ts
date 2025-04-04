import type { ElementType } from "react";
import type { CompositeGroupLabelOptions } from "../composite/composite-group-label.tsx";
import type { Props } from "../utils/types.ts";
import type { SelectStore } from "./select-store.ts";
declare const TagName = "div";
type TagName = typeof TagName;
/**
 * Returns props to create a `SelectGroupLabel` component. This hook must be
 * used in a component that's wrapped with `SelectGroup` so the
 * `aria-labelledby` prop is properly set on the select group element.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * // This component must be wrapped with SelectGroup
 * const props = useSelectGroupLabel();
 * <Role {...props}>Label</Role>
 * ```
 */
export declare const useSelectGroupLabel: import("../utils/types.ts").Hook<"div", SelectGroupLabelOptions<"div">>;
/**
 * Renders a label in a select group. This component must be wrapped with
 * [`SelectGroup`](https://ariakit.org/reference/select-group) so the
 * `aria-labelledby` prop is properly set on the select group element.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx {5,10}
 * <SelectProvider>
 *   <Select />
 *   <SelectPopover>
 *     <SelectGroup>
 *       <SelectGroupLabel>Fruits</SelectGroupLabel>
 *       <SelectItem value="Apple" />
 *       <SelectItem value="Orange" />
 *     </SelectGroup>
 *     <SelectGroup>
 *       <SelectGroupLabel>Meat</SelectGroupLabel>
 *       <SelectItem value="Beef" />
 *       <SelectItem value="Chicken" />
 *     </SelectGroup>
 *   </SelectPopover>
 * </SelectProvider>
 * ```
 */
export declare const SelectGroupLabel: (props: SelectGroupLabelProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface SelectGroupLabelOptions<T extends ElementType = TagName> extends CompositeGroupLabelOptions<T> {
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
export type SelectGroupLabelProps<T extends ElementType = TagName> = Props<T, SelectGroupLabelOptions<T>>;
export {};
