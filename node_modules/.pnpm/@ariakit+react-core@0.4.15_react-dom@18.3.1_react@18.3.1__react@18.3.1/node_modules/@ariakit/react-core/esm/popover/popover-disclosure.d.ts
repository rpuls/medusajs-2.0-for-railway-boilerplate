import type { ElementType } from "react";
import type { DialogDisclosureOptions } from "../dialog/dialog-disclosure.tsx";
import type { Props } from "../utils/types.ts";
import type { PopoverAnchorOptions } from "./popover-anchor.tsx";
declare const TagName = "button";
type TagName = typeof TagName;
/**
 * Returns props to create a `PopoverDisclosure` component.
 * @see https://ariakit.org/components/popover
 * @example
 * ```jsx
 * const store = usePopoverStore();
 * const props = usePopoverDisclosure({ store });
 * <Role {...props}>Disclosure</Role>
 * <Popover store={store}>Popover</Popover>
 * ```
 */
export declare const usePopoverDisclosure: import("../utils/types.ts").Hook<"button", PopoverDisclosureOptions<"button">>;
/**
 * Renders a button that controls the visibility of the
 * [`Popover`](https://ariakit.org/reference/popover) component when clicked.
 * @see https://ariakit.org/components/popover
 * @example
 * ```jsx {2}
 * <PopoverProvider>
 *   <PopoverDisclosure>Disclosure</PopoverDisclosure>
 *   <Popover>Popover</Popover>
 * </PopoverProvider>
 * ```
 */
export declare const PopoverDisclosure: (props: PopoverDisclosureProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface PopoverDisclosureOptions<T extends ElementType = TagName> extends PopoverAnchorOptions<T>, Omit<DialogDisclosureOptions<T>, "store"> {
}
export type PopoverDisclosureProps<T extends ElementType = TagName> = Props<T, PopoverDisclosureOptions<T>>;
export {};
