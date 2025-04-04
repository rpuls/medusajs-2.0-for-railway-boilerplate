import type { ElementType } from "react";
import type { Options, Props } from "../utils/types.ts";
import type { SelectStore } from "./select-store.ts";
declare const TagName = "div";
type TagName = typeof TagName;
/**
 * Returns props to create a `SelectLabel` component. Since it's not a native
 * select element, we can't use the native label element. The `SelectLabel`
 * component will move focus and click on the `Select` component when the user
 * clicks on the label.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const store = useSelectStore();
 * const props = useSelectLabel({ store });
 * <Role {...props}>Favorite fruit</Role>
 * <Select store={store} />
 * ```
 */
export declare const useSelectLabel: import("../utils/types.ts").Hook<"div", SelectLabelOptions<"div">>;
/**
 * Renders a label for the [`Select`](https://ariakit.org/reference/select)
 * component. Since it's not a native select element, we can't use the native
 * label element. This component will move focus and click on the
 * [`Select`](https://ariakit.org/reference/select) component when clicked.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx {2}
 * <SelectProvider defaultValue="Apple">
 *   <SelectLabel>Favorite fruit</SelectLabel>
 *   <Select />
 *   <SelectPopover>
 *     <SelectItem value="Apple" />
 *     <SelectItem value="Orange" />
 *   </SelectPopover>
 * </SelectProvider>
 * ```
 */
export declare const SelectLabel: (props: SelectLabelProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface SelectLabelOptions<_T extends ElementType = TagName> extends Options {
    /**
     * Object returned by the
     * [`useSelectStore`](https://ariakit.org/reference/use-select-store) hook. If
     * not provided, the closest
     * [`SelectProvider`](https://ariakit.org/reference/select-provider)
     * component's context will be used.
     */
    store?: SelectStore;
}
export type SelectLabelProps<T extends ElementType = TagName> = Props<T, SelectLabelOptions<T>>;
export {};
