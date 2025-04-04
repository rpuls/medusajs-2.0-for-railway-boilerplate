import type { BooleanOrCallback } from "@ariakit/core/utils/types";
import type { ElementType, MouseEvent as ReactMouseEvent } from "react";
import type { FocusableOptions } from "../focusable/focusable.tsx";
import type { Props } from "../utils/types.ts";
import type { HovercardStore } from "./hovercard-store.ts";
declare const TagName = "a";
type TagName = typeof TagName;
/**
 * Returns props to create a `HovercardAnchor` component.
 * @see https://ariakit.org/components/hovercard
 * @example
 * ```jsx
 * const store = useHovercardStore();
 * const props = useHovercardAnchor({ store });
 * <Role {...props} render={<a />}>@username</Role>
 * <Hovercard store={store}>Details</Hovercard>
 * ```
 */
export declare const useHovercardAnchor: import("../utils/types.ts").Hook<"a", HovercardAnchorOptions<"a">>;
/**
 * Renders an anchor element that will open a
 * [`Hovercard`](https://ariakit.org/reference/hovercard) popup on hover.
 * @see https://ariakit.org/components/hovercard
 * @example
 * ```jsx {2}
 * <HovercardProvider>
 *   <HovercardAnchor>@username</HovercardAnchor>
 *   <Hovercard>Details</Hovercard>
 * </HovercardProvider>
 * ```
 */
export declare const HovercardAnchor: (props: HovercardAnchorProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface HovercardAnchorOptions<T extends ElementType = TagName> extends FocusableOptions<T> {
    /**
     * Object returned by the
     * [`useHovercardStore`](https://ariakit.org/reference/use-hovercard-store)
     * hook. If not provided, the closest
     * [`HovercardProvider`](https://ariakit.org/reference/hovercard-provider)
     * component's context will be used.
     */
    store?: HovercardStore;
    /**
     * Shows the content element based on the user's _hover intent_ over the
     * anchor element. This behavior purposely ignores mobile touch and
     * unintentional mouse enter events, like those that happen during scrolling.
     *
     * Live examples:
     * - [Navigation Menubar](https://ariakit.org/examples/menubar-navigation)
     * - [Sliding Menu](https://ariakit.org/examples/menu-slide)
     * @default true
     */
    showOnHover?: BooleanOrCallback<ReactMouseEvent<HTMLElement>>;
}
export type HovercardAnchorProps<T extends ElementType = TagName> = Props<T, HovercardAnchorOptions<T>>;
export {};
