import type { ElementType } from "react";
import type { Options, Props } from "../utils/types.ts";
declare const TagName = "div";
type TagName = typeof TagName;
/**
 * Returns props to create a `Group` component.
 * @see https://ariakit.org/components/group
 * @example
 * ```jsx
 * const props = useGroup();
 * <Role {...props}>Group</Role>
 * ```
 */
export declare const useGroup: import("../utils/types.ts").Hook<"div", Options>;
/**
 * Renders a group element. Optionally, a
 * [`GroupLabel`](https://ariakit.org/reference/group-label) can be rendered as
 * a child to provide a label for the group.
 * @see https://ariakit.org/components/group
 * @example
 * ```jsx
 * <Group>Group</Group>
 * ```
 */
export declare const Group: (props: GroupProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export type GroupOptions<_T extends ElementType = TagName> = Options;
export type GroupProps<T extends ElementType = TagName> = Props<T, GroupOptions<T>>;
export {};
