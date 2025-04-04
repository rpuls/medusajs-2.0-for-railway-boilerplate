import type { ElementType } from "react";
import type { DialogDismissOptions } from "../dialog/dialog-dismiss.tsx";
import type { Props } from "../utils/types.ts";
import type { PopoverStore } from "./popover-store.ts";
declare const TagName = "button";
type TagName = typeof TagName;
/**
 * Returns props to create a `PopoverDismiss` component.
 * @see https://ariakit.org/components/popover
 * @example
 * ```jsx
 * const store = usePopoverStore();
 * const props = usePopoverDismiss({ store });
 * <Popover store={store}>
 *   <Role {...props} />
 * </Popover>
 * ```
 */
export declare const usePopoverDismiss: import("../utils/types.ts").Hook<"button", PopoverDismissOptions<"button">>;
/**
 * Renders a button that hides a
 * [`Popover`](https://ariakit.org/reference/popover) component when clicked.
 * @see https://ariakit.org/components/popover
 * @example
 * ```jsx {3}
 * <PopoverProvider>
 *   <Popover>
 *     <PopoverDismiss />
 *   </Popover>
 * </PopoverProvider>
 * ```
 */
export declare const PopoverDismiss: (props: PopoverDismissProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface PopoverDismissOptions<T extends ElementType = TagName> extends DialogDismissOptions<T> {
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
export type PopoverDismissProps<T extends ElementType = TagName> = Props<T, PopoverDismissOptions<T>>;
export {};
