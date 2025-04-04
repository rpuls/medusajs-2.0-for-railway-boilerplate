import type { ElementType } from "react";
import type { PopoverOptions } from "../popover/popover.tsx";
import type { Props } from "../utils/types.ts";
import type { ComboboxListOptions } from "./combobox-list.tsx";
declare const TagName = "div";
type TagName = typeof TagName;
/**
 * Returns props to create a `ComboboxPopover` component.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx
 * const store = useComboboxStore();
 * const props = useComboboxPopover({ store });
 * <Role {...props}>
 *   <ComboboxItem value="Item 1" />
 *   <ComboboxItem value="Item 2" />
 *   <ComboboxItem value="Item 3" />
 * </Role>
 * ```
 */
export declare const useComboboxPopover: import("../utils/types.ts").Hook<"div", ComboboxPopoverOptions<"div">>;
/**
 * Renders a combobox popover. The `role` prop is set to `listbox` by default,
 * but can be overriden by any other valid combobox popup role (`listbox`,
 * `menu`, `tree`, `grid` or `dialog`).
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx {3-7}
 * <ComboboxProvider>
 *   <Combobox />
 *   <ComboboxPopover>
 *     <ComboboxItem value="Apple" />
 *     <ComboboxItem value="Banana" />
 *     <ComboboxItem value="Orange" />
 *   </ComboboxPopover>
 * </ComboboxProvider>
 * ```
 */
export declare const ComboboxPopover: (props: ComboboxPopoverProps<"div">) => import("react/jsx-runtime").JSX.Element | null;
export interface ComboboxPopoverOptions<T extends ElementType = TagName> extends ComboboxListOptions<T>, Omit<PopoverOptions<T>, "store"> {
}
export type ComboboxPopoverProps<T extends ElementType = TagName> = Props<T, ComboboxPopoverOptions<T>>;
export {};
