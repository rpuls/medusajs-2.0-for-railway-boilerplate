import type { ElementType } from "react";
import type { Options, Props } from "../utils/types.ts";
declare const TagName = "span";
type TagName = typeof TagName;
/**
 * Returns props to create a `VisuallyHidden` component. When applying the props
 * returned by this hook to a component, the component will be visually hidden,
 * but still accessible to screen readers.
 * @see https://ariakit.org/components/visually-hidden
 * @example
 * ```jsx
 * const props = useVisuallyHidden();
 * <a href="#">
 *   Learn more<Role {...props}> about the Solar System</Role>.
 * </a>
 * ```
 */
export declare const useVisuallyHidden: import("../utils/types.ts").Hook<"span", VisuallyHiddenOptions<"span">>;
/**
 * Renders an element that's visually hidden, but still accessible to screen
 * readers.
 * @see https://ariakit.org/components/visually-hidden
 * @example
 * ```jsx
 * <a href="#">
 *   Learn more<VisuallyHidden> about the Solar System</VisuallyHidden>.
 * </a>
 * ```
 */
export declare const VisuallyHidden: (props: VisuallyHiddenProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface VisuallyHiddenOptions<_T extends ElementType = TagName> extends Options {
}
export type VisuallyHiddenProps<T extends ElementType = TagName> = Props<T, VisuallyHiddenOptions<T>>;
export {};
