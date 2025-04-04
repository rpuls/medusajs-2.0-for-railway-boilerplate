import type { ElementType } from "react";
import type { PopoverDismissOptions } from "../popover/popover-dismiss.tsx";
import type { Props } from "../utils/types.ts";
import type { HovercardStore } from "./hovercard-store.ts";
declare const TagName = "button";
type TagName = typeof TagName;
/**
 * Returns props to create a `HovercardDismiss` component.
 * @see https://ariakit.org/components/hovercard
 * @example
 * ```jsx
 * const store = useHovercardStore();
 * const props = useHovercardDismiss({ store });
 * <Hovercard store={store}>
 *   <Role {...props} />
 * </Hovercard>
 * ```
 */
export declare const useHovercardDismiss: import("../utils/types.ts").Hook<"button", HovercardDismissOptions<"button">>;
/**
 * Renders a button that hides a
 * [`Hovercard`](https://ariakit.org/reference/hovercard) when clicked.
 * @see https://ariakit.org/components/hovercard
 * @example
 * ```jsx {3}
 * <HovercardProvider>
 *   <Hovercard>
 *     <HovercardDismiss />
 *   </Hovercard>
 * </HovercardProvider>
 * ```
 */
export declare const HovercardDismiss: (props: HovercardDismissProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface HovercardDismissOptions<T extends ElementType = TagName> extends PopoverDismissOptions<T> {
    /**
     * Object returned by the
     * [`useHovercardStore`](https://ariakit.org/reference/use-hovercard-store)
     * hook. If not provided, the closest
     * [`Hovercard`](https://ariakit.org/reference/hovercard) or
     * [`HovercardProvider`](https://ariakit.org/reference/hovercard-provider)
     * components' context will be used.
     */
    store?: HovercardStore;
}
export type HovercardDismissProps<T extends ElementType = TagName> = Props<T, HovercardDismissOptions<T>>;
export {};
