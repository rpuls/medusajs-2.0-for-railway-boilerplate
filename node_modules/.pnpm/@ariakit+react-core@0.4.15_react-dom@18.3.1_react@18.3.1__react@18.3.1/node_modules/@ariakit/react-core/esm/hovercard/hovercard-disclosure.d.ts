import type { ElementType } from "react";
import type { DialogDisclosureOptions } from "../dialog/dialog-disclosure.tsx";
import type { Props } from "../utils/types.ts";
import type { HovercardStore } from "./hovercard-store.ts";
declare const TagName = "button";
type TagName = typeof TagName;
/**
 * Returns props to create a `HovercardDisclosure` component.
 * @see https://ariakit.org/components/hovercard
 * @example
 * ```jsx
 * const store = useHovercardStore();
 * const props = useHovercardDisclosure({ store });
 * <HovercardAnchor store={store}>@username</HovercardAnchor>
 * <Role {...props} />
 * <Hovercard store={store}>Details</Hovercard>
 * ```
 */
export declare const useHovercardDisclosure: import("../utils/types.ts").Hook<"button", HovercardDisclosureOptions<"button">>;
/**
 * Renders a hidden disclosure button that will be visible when the
 * [`HovercardAnchor`](https://ariakit.org/reference/hovercard-anchor) receives
 * keyboard focus. The user can then navigate to the button to open the
 * hovercard when using the keyboard.
 * @see https://ariakit.org/components/hovercard
 * @example
 * ```jsx {3}
 * <HovercardProvider>
 *   <HovercardAnchor>@username</HovercardAnchor>
 *   <HovercardDisclosure />
 *   <Hovercard>Details</Hovercard>
 * </HovercardProvider>
 * ```
 */
export declare const HovercardDisclosure: (props: HovercardDisclosureProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface HovercardDisclosureOptions<T extends ElementType = TagName> extends DialogDisclosureOptions<T> {
    /**
     * Object returned by the
     * [`useHovercardStore`](https://ariakit.org/reference/use-hovercard-store)
     * hook. If not provided, the closest
     * [`HovercardProvider`](https://ariakit.org/reference/hovercard-provider)
     * component's context will be used.
     */
    store?: HovercardStore;
}
export type HovercardDisclosureProps<T extends ElementType = TagName> = Props<T, HovercardDisclosureOptions<T>>;
export {};
