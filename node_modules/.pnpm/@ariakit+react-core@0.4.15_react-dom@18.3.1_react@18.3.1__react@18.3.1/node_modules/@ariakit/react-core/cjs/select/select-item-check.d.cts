import type { ElementType } from "react";
import type { CheckboxCheckOptions } from "../checkbox/checkbox-check.tsx";
import type { Props } from "../utils/types.ts";
import type { SelectStore } from "./select-store.ts";
declare const TagName = "span";
type TagName = typeof TagName;
/**
 * Returns props to create a `SelectItemCheck` component. This hook must be used
 * in a component that's wrapped with `SelectItem` or the `checked` prop must be
 * explicitly passed to the component.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const props = useSelectItemCheck({ checked: true });
 * <Role {...props} />
 * ```
 */
export declare const useSelectItemCheck: import("../utils/types.ts").Hook<"span", SelectItemCheckOptions<"span">>;
/**
 * Renders a checkmark icon when the
 * [`checked`](https://ariakit.org/reference/select-item-check#checked) prop is
 * `true`. The icon can be overridden by providing a different one as children.
 *
 * When rendered inside a
 * [`SelectItem`](https://ariakit.org/reference/select-item) component, the
 * [`checked`](https://ariakit.org/reference/select-item-check#checked) prop is
 * automatically derived from the context.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx {5,9}
 * <SelectProvider>
 *   <Select />
 *   <SelectPopover>
 *     <SelectItem value="Apple">
 *       <SelectItemCheck />
 *       Apple
 *     </SelectItem>
 *     <SelectItem value="Orange">
 *       <SelectItemCheck />
 *       Orange
 *     </SelectItem>
 *   </SelectPopover>
 * </SelectProvider>
 * ```
 */
export declare const SelectItemCheck: (props: SelectItemCheckProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface SelectItemCheckOptions<T extends ElementType = TagName> extends CheckboxCheckOptions<T> {
    /**
     * Object returned by the
     * [`useSelectStore`](https://ariakit.org/reference/use-select-store) hook.
     */
    store?: SelectStore;
}
export type SelectItemCheckProps<T extends ElementType = TagName> = Props<T, SelectItemCheckOptions<T>>;
export {};
