import type { BooleanOrCallback } from "@ariakit/core/utils/types";
import type { ElementType, KeyboardEvent, MouseEvent, SelectHTMLAttributes } from "react";
import type { CompositeTypeaheadOptions } from "../composite/composite-typeahead.tsx";
import type { PopoverDisclosureOptions } from "../popover/popover-disclosure.tsx";
import type { Props } from "../utils/types.ts";
import type { SelectStore } from "./select-store.ts";
declare const TagName = "button";
type TagName = typeof TagName;
/**
 * Returns props to create a `Select` component.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const store = useSelectStore();
 * const props = useSelect({ store });
 * <Role {...props} />
 * ```
 */
export declare const useSelect: import("../utils/types.ts").Hook<"button", SelectOptions<"button">>;
/**
 * Renders a custom select element that controls the visibility of either a
 * [`SelectList`](https://ariakit.org/reference/select-list) or a
 * [`SelectPopover`](https://ariakit.org/reference/select-popover) component.
 *
 * By default, the
 * [`value`](https://ariakit.org/reference/select-provider#value) state is
 * rendered as the children, followed by a
 * [`SelectArrow`](https://ariakit.org/reference/select-arrow) component. This
 * can be customized by passing different children to the component.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx {2}
 * <SelectProvider>
 *   <Select />
 *   <SelectPopover>
 *     <SelectItem value="Apple" />
 *     <SelectItem value="Orange" />
 *   </SelectPopover>
 * </SelectProvider>
 * ```
 */
export declare const Select: (props: SelectProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface SelectOptions<T extends ElementType = TagName> extends PopoverDisclosureOptions<T>, CompositeTypeaheadOptions<T>, Pick<SelectHTMLAttributes<HTMLSelectElement>, "name" | "form" | "required"> {
    /**
     * Object returned by the
     * [`useSelectStore`](https://ariakit.org/reference/use-select-store) hook. If
     * not provided, the closest
     * [`SelectProvider`](https://ariakit.org/reference/select-provider)
     * component's context will be used.
     */
    store?: SelectStore;
    /**
     * Determines if the
     * [`SelectList`](https://ariakit.org/reference/select-list) or
     * [`SelectPopover`](https://ariakit.org/reference/select-popover) components
     * will appear when the user uses arrow keys while the select element is
     * in focus.
     *
     * Live examples:
     * - [Select Grid](https://ariakit.org/examples/select-grid)
     * @default true
     */
    showOnKeyDown?: BooleanOrCallback<KeyboardEvent<HTMLElement>>;
    /**
     * Determines whether pressing arrow keys will move the active item even when
     * the [`SelectList`](https://ariakit.org/reference/select-list) or
     * [`SelectPopover`](https://ariakit.org/reference/select-popover) components
     * are hidden.
     * @default false
     */
    moveOnKeyDown?: BooleanOrCallback<KeyboardEvent<HTMLElement>>;
    /**
     * Determines whether pressing Space, Enter, or a click event will
     * [`toggle`](https://ariakit.org/reference/use-select-store#toggle) the
     * [`SelectList`](https://ariakit.org/reference/select-list) or
     * [`SelectPopover`](https://ariakit.org/reference/select-popover) components.
     * @default true
     * @deprecated Use
     * [`toggleOnClick`](https://ariakit.org/reference/select#toggleonclick)
     * instead.
     */
    toggleOnPress?: BooleanOrCallback<MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>>;
}
export type SelectProps<T extends ElementType = TagName> = Props<T, SelectOptions<T>>;
export {};
