import type { ElementType } from "react";
import type { PopoverHeadingOptions } from "../popover/popover-heading.tsx";
import type { Props } from "../utils/types.ts";
import type { HovercardStore } from "./hovercard-store.ts";
declare const TagName = "h1";
type TagName = typeof TagName;
/**
 * Returns props to create a `HovercardHeading` component. This hook must be
 * used in a component that's wrapped with `Hovercard` so the `aria-labelledby`
 * prop is properly set on the hovercard element.
 * @see https://ariakit.org/components/hovercard
 * @example
 * ```jsx
 * // This component must be wrapped with Hovercard
 * const props = useHovercardHeading();
 * <Role {...props}>Heading</Role>
 * ```
 */
export declare const useHovercardHeading: import("../utils/types.ts").Hook<"h1", HovercardHeadingOptions<"h1">>;
/**
 * Renders a heading in a hovercard. This component must be wrapped within
 * [`Hovercard`](https://ariakit.org/reference/hovercard) so the
 * `aria-labelledby` prop is properly set on the content element.
 * @see https://ariakit.org/components/hovercard
 * @example
 * ```jsx {3}
 * <HovercardProvider>
 *   <Hovercard>
 *     <HovercardHeading>Heading</HovercardHeading>
 *   </Hovercard>
 * </HovercardProvider>
 * ```
 */
export declare const HovercardHeading: (props: HovercardHeadingProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface HovercardHeadingOptions<T extends ElementType = TagName> extends PopoverHeadingOptions<T> {
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
export type HovercardHeadingProps<T extends ElementType = TagName> = Props<T, HovercardHeadingOptions<T>>;
export {};
