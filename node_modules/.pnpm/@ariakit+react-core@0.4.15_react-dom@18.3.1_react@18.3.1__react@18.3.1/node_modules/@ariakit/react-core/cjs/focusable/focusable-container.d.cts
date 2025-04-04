import type { ElementType } from "react";
import type { Options, Props } from "../utils/types.ts";
declare const TagName = "div";
type TagName = typeof TagName;
/**
 * Returns props to create a `FocusableContainer` component.
 * @see https://ariakit.org/components/focusable
 * @example
 * ```jsx
 * const props = useFocusableContainer();
 * <Role {...props} />
 * ```
 */
export declare const useFocusableContainer: import("../utils/types.ts").Hook<"div", FocusableContainerOptions<"div">>;
/**
 * Renders a div that wraps
 * [`Focusable`](https://ariakit.org/reference/focusable) components and
 * controls whether they can be auto-focused.
 * @see https://ariakit.org/components/focusable
 * @example
 * ```jsx
 * <FocusableContainer autoFocusOnShow={false}>
 *   <Focusable autoFocus />
 * </FocusableContainer>
 * ```
 */
export declare const FocusableContainer: (props: FocusableContainerProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface FocusableContainerOptions<_T extends ElementType = TagName> extends Options {
    /**
     * Determines whether [`Focusable`](https://ariakit.org/reference/focusable)
     * elements inside the container should be automatically focused when the
     * container is shown and they have the
     * [`autoFocus`](https://ariakit.org/reference/focusable#autofocus) prop.
     * @default true
     */
    autoFocusOnShow?: boolean;
}
export type FocusableContainerProps<T extends ElementType = TagName> = Props<T, FocusableContainerOptions<T>>;
export {};
