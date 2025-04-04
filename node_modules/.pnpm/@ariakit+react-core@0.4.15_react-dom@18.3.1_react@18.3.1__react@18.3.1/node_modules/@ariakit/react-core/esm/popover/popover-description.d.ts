import type { ElementType } from "react";
import type { DialogDescriptionOptions } from "../dialog/dialog-description.tsx";
import type { Props } from "../utils/types.ts";
import type { PopoverStore } from "./popover-store.ts";
declare const TagName = "p";
type TagName = typeof TagName;
/**
 * Returns props to create a `PopoverDescription` component. This hook must be
 * used in a component that's wrapped with `Popover` so the `aria-describedby`
 * prop is properly set on the popover element.
 * @see https://ariakit.org/components/popover
 * @example
 * ```jsx
 * // This component must be wrapped with Popover
 * const props = usePopoverDescription();
 * <Role {...props}>Description</Role>
 * ```
 */
export declare const usePopoverDescription: import("../utils/types.ts").Hook<"p", PopoverDescriptionOptions<"p">>;
/**
 * Renders a description in a popover. This component must be wrapped with
 * [`Popover`](https://ariakit.org/reference/popover) so the `aria-describedby`
 * prop is properly set on the popover element.
 * @see https://ariakit.org/components/popover
 * @example
 * ```jsx {3}
 * <PopoverProvider>
 *   <Popover>
 *     <PopoverDescription>Description</PopoverDescription>
 *   </Popover>
 * </PopoverProvider>
 * ```
 */
export declare const PopoverDescription: (props: PopoverDescriptionProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface PopoverDescriptionOptions<T extends ElementType = TagName> extends DialogDescriptionOptions<T> {
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
export type PopoverDescriptionProps<T extends ElementType = TagName> = Props<T, PopoverDescriptionOptions<T>>;
export {};
