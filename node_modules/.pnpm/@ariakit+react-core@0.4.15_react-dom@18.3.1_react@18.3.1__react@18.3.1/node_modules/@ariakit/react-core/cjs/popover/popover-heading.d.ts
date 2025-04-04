import type { ElementType } from "react";
import type { DialogHeadingOptions } from "../dialog/dialog-heading.tsx";
import type { Props } from "../utils/types.ts";
import type { PopoverStore } from "./popover-store.ts";
declare const TagName = "h1";
type TagName = typeof TagName;
/**
 * Returns props to create a `PopoverHeading` component. This hook must be used
 * in a component that's wrapped with `Popover` so the `aria-labelledby` prop is
 * properly set on the popover element.
 * @see https://ariakit.org/components/popover
 * @example
 * ```jsx
 * // This component must be wrapped with Popover
 * const props = usePopoverHeading();
 * <Role {...props}>Heading</Role>
 * ```
 */
export declare const usePopoverHeading: import("../utils/types.ts").Hook<"h1", PopoverHeadingOptions<"h1">>;
/**
 * Renders a heading in a popover. This component must be wrapped with
 * [`Popover`](https://ariakit.org/reference/popover) so the `aria-labelledby`
 * prop is properly set on the popover element.
 * @see https://ariakit.org/components/popover
 * @example
 * ```jsx {3}
 * <PopoverProvider>
 *   <Popover>
 *     <PopoverHeading>Heading</PopoverHeading>
 *   </Popover>
 * </PopoverProvider>
 * ```
 */
export declare const PopoverHeading: (props: PopoverHeadingProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface PopoverHeadingOptions<T extends ElementType = TagName> extends DialogHeadingOptions<T> {
    /**
     * Object returned by the
     * [`usePopoverStore`](https://ariakit.org/reference/use-popover-store) hook.
     * If not provided, the closest
     * [`Popover`](https://ariakit.org/reference/popover) or
     * [`PopoverProvider`](https://ariakit.org/reference/popover-provider)
     * components' context will be used.
     */
    store?: PopoverStore;
}
export type PopoverHeadingProps<T extends ElementType = TagName> = Props<T, PopoverHeadingOptions<T>>;
export {};
