import type { ElementType } from "react";
import type { Options, Props } from "../utils/types.ts";
import type { HeadingLevels } from "./utils.ts";
type HeadingElements = `h${HeadingLevels}`;
declare const TagName = "h1";
type TagName = HeadingElements;
/**
 * Returns props to create a `Heading` component. The element type (or the
 * `aria-level` prop, if the element type is not a native heading) is determined
 * by the context level provided by the parent `HeadingLevel` component.
 * @see https://ariakit.org/components/heading
 * @example
 * ```jsx
 * const props = useHeading();
 * <Role {...props}>Heading</Role>
 * ```
 */
export declare const useHeading: import("../utils/types.ts").Hook<"h1" | "h2" | "h3" | "h4" | "h5" | "h6", HeadingOptions<"h1" | "h2" | "h3" | "h4" | "h5" | "h6">>;
/**
 * Renders a heading element. The element type (or the `aria-level` attribute,
 * if the element type is not a native heading) is determined by the context
 * level provided by the closest
 * [`HeadingLevel`](https://ariakit.org/reference/heading-level) ancestor.
 * @see https://ariakit.org/components/heading
 * @example
 * ```jsx
 * <HeadingLevel>
 *   <Heading>Heading 1</Heading>
 *   <HeadingLevel>
 *     <Heading>Heading 2</Heading>
 *   </HeadingLevel>
 * </HeadingLevel>
 * ```
 */
export declare const Heading: (props: HeadingProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface HeadingOptions<_T extends ElementType = TagName> extends Options {
}
export type HeadingProps<T extends ElementType = TagName> = Props<T, HeadingOptions<T>>;
export {};
