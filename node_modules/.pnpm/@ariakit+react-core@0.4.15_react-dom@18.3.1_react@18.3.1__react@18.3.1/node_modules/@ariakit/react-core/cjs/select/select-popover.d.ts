import type { ElementType } from "react";
import type { PopoverOptions } from "../popover/popover.tsx";
import type { Props } from "../utils/types.ts";
import type { SelectListOptions } from "./select-list.tsx";
declare const TagName = "div";
type TagName = typeof TagName;
/**
 * Returns props to create a `SelectPopover` component.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const store = useSelectStore();
 * const props = useSelectPopover({ store });
 * <Role {...props}>
 *   <SelectItem value="Apple" />
 *   <SelectItem value="Orange" />
 * </Role>
 * ```
 */
export declare const useSelectPopover: import("../utils/types.ts").Hook<"div", SelectPopoverOptions<"div">>;
/**
 * Renders a select popover. The `role` attribute is set to `listbox` by
 * default, but can be overriden by any other valid select popup role
 * (`listbox`, `menu`, `tree`, `grid` or `dialog`).
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx {3-6}
 * <SelectProvider>
 *   <Select />
 *   <SelectPopover>
 *     <SelectItem value="Apple" />
 *     <SelectItem value="Orange" />
 *   </SelectPopover>
 * </SelectProvider>
 * ```
 */
export declare const SelectPopover: (props: SelectPopoverProps<"div">) => import("react/jsx-runtime").JSX.Element | null;
export interface SelectPopoverOptions<T extends ElementType = TagName> extends SelectListOptions<T>, Omit<PopoverOptions<T>, "store"> {
}
export type SelectPopoverProps<T extends ElementType = TagName> = Props<T, SelectPopoverOptions<T>>;
export {};
