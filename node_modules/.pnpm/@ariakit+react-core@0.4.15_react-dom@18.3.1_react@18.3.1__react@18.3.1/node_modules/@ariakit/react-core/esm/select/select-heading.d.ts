import type { ElementType } from "react";
import type { PopoverHeadingOptions } from "../popover/popover-heading.tsx";
import type { Props } from "../utils/types.ts";
import type { SelectStore } from "./select-store.ts";
declare const TagName = "h1";
type TagName = typeof TagName;
/**
 * Returns props to create a `SelectHeading` component.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const props = useSelectHeading();
 * <Role {...props}>Heading</Role>
 * ```
 */
export declare const useSelectHeading: import("../utils/types.ts").Hook<"h1", SelectHeadingOptions<"h1">>;
/**
 * Renders a heading element that serves as a label for
 * [`SelectPopover`](https://ariakit.org/reference/select-popover) and
 * [`SelectList`](https://ariakit.org/reference/select-list) components.
 *
 * When this component is rendered within
 * [`SelectPopover`](https://ariakit.org/reference/select-popover), all
 * [`SelectItem`](https://ariakit.org/reference/select-item) elements must be
 * rendered within a [`SelectList`](https://ariakit.org/reference/select-list)
 * instead of directly within the popover.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx {4}
 * <SelectProvider>
 *   <Select />
 *   <SelectPopover>
 *     <SelectHeading>Fruits</SelectHeading>
 *     <SelectList>
 *       <SelectItem value="Apple" />
 *       <SelectItem value="Orange" />
 *     </SelectList>
 *   </SelectPopover>
 * </SelectProvider>
 * ```
 */
export declare const SelectHeading: (props: SelectHeadingProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface SelectHeadingOptions<T extends ElementType = TagName> extends PopoverHeadingOptions<T> {
    /**
     * Object returned by the
     * [`useSelectStore`](https://ariakit.org/reference/use-select-store) hook.
     * If not provided, the closest
     * [`Select`](https://ariakit.org/reference/select) or
     * [`SelectProvider`](https://ariakit.org/reference/select-provider)
     * components' context will be used.
     */
    store?: SelectStore;
}
export type SelectHeadingProps<T extends ElementType = TagName> = Props<T, SelectHeadingOptions<T>>;
export {};
