import type { ElementType } from "react";
import type { Options, Props } from "../utils/types.ts";
declare const TagName = "hr";
type TagName = typeof TagName;
/**
 * Returns props to create a `Separator` component.
 * @see https://ariakit.org/components/separator
 * @example
 * ```jsx
 * const props = useSeparator({ orientation: "horizontal" });
 * <Role {...props} />
 * ```
 */
export declare const useSeparator: import("../utils/types.ts").Hook<"hr", SeparatorOptions<"hr">>;
/**
 * Renders a separator element.
 * @see https://ariakit.org/components/separator
 * @example
 * ```jsx
 * <Separator orientation="horizontal" />
 * ```
 */
export declare const Separator: (props: SeparatorProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface SeparatorOptions<_T extends ElementType = TagName> extends Options {
    /**
     * The orientation of the separator.
     * @default "horizontal"
     */
    orientation?: "horizontal" | "vertical";
}
export type SeparatorProps<T extends ElementType = TagName> = Props<T, SeparatorOptions<T>>;
export {};
