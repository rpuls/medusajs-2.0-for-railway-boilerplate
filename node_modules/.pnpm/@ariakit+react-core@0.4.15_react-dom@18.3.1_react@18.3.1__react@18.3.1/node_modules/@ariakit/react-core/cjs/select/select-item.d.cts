import type { BooleanOrCallback } from "@ariakit/core/utils/types";
import type { ElementType, MouseEvent } from "react";
import type { CompositeHoverOptions } from "../composite/composite-hover.tsx";
import type { CompositeItemOptions } from "../composite/composite-item.tsx";
import type { Props } from "../utils/types.ts";
import type { SelectStore } from "./select-store.ts";
declare const TagName = "div";
type TagName = typeof TagName;
/**
 * Returns props to create a `SelectItem` component.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const store = useSelectStore();
 * const props = useSelectItem({ store, value: "Apple" });
 * <Role {...props} />
 * ```
 */
export declare const useSelectItem: import("../utils/types.ts").Hook<"div", SelectItemOptions<"div">>;
/**
 * Renders a select item inside a
 * [`SelectList`](https://ariakit.org/reference/select-list) or
 * [`SelectPopover`](https://ariakit.org/reference/select-popover).
 *
 * The `role` attribute will be automatically set on the item based on the
 * list's own `role` attribute. For example, if the
 * [`SelectPopover`](https://ariakit.org/reference/select-popover) component's
 * `role` attribute is set to `listbox` (which is the default), the item `role`
 * will be set to `option`.
 *
 * By default, the [`value`](https://ariakit.org/reference/select-item#value)
 * prop will be rendered as the children, but this can be overriden if a custom
 * children is provided.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx {4-5}
 * <SelectProvider>
 *   <Select />
 *   <SelectPopover>
 *     <SelectItem value="Apple" />
 *     <SelectItem value="Orange" />
 *   </SelectPopover>
 * </SelectProvider>
 * ```
 */
export declare const SelectItem: (props: SelectItemProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface SelectItemOptions<T extends ElementType = TagName> extends CompositeItemOptions<T>, CompositeHoverOptions<T> {
    /**
     * Object returned by the
     * [`useSelectStore`](https://ariakit.org/reference/use-select-store) hook. If
     * not provided, the parent
     * [`SelectList`](https://ariakit.org/reference/select-list) or
     * [`SelectPopover`](https://ariakit.org/reference/select-popover) components'
     * context will be used.
     */
    store?: SelectStore;
    /**
     * The value of the item. This will be rendered as the children by default.
     * - If
     *   [`setValueOnClick`](https://ariakit.org/reference/select-item#setvalueonclick)
     *   is set to `true`, the
     *   [`value`](https://ariakit.org/reference/select-provider#value) state will
     *   be set to this value when the user clicks on it.
     * - If
     *   [`setValueOnMove`](https://ariakit.org/reference/select-provider#setvalueonmove)
     *   is set to `true`, the
     *   [`value`](https://ariakit.org/reference/select-provider#value) state will
     *   be set to this value when the user moves to it (which is usually the case
     *   when moving through the items using the keyboard).
     *
     * Live examples:
     * - [Form with Select](https://ariakit.org/examples/form-select)
     * - [Animated Select](https://ariakit.org/examples/select-animated)
     * - [Select with Combobox](https://ariakit.org/examples/select-combobox)
     * - [Select Grid](https://ariakit.org/examples/select-grid)
     * - [SelectGroup](https://ariakit.org/examples/select-group)
     * - [Select with custom
     *   item](https://ariakit.org/examples/select-item-custom)
     * @example
     * ```jsx
     * <SelectItem value="Apple" />
     * ```
     */
    value?: string;
    /**
     * Whether to hide the select when this item is clicked. By default, it's
     * `true` when the [`value`](https://ariakit.org/reference/select-item#value)
     * prop is also provided.
     */
    hideOnClick?: BooleanOrCallback<MouseEvent<HTMLElement>>;
    /**
     * Whether to set the select value with this item's value, if any, when this
     * item is clicked. By default, it's `true` when the
     * [`value`](https://ariakit.org/reference/select-item#value) prop is also
     * provided.
     *
     * Live examples:
     * - [Select with Next.js App
     *   Router](https://ariakit.org/examples/select-next-router)
     */
    setValueOnClick?: BooleanOrCallback<MouseEvent<HTMLElement>>;
}
export type SelectItemProps<T extends ElementType = TagName> = Props<T, SelectItemOptions<T>>;
export {};
