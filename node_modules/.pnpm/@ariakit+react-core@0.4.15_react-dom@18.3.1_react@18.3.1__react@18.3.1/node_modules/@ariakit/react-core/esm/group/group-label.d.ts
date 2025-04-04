import type { ElementType } from "react";
import type { Options, Props } from "../utils/types.ts";
declare const TagName = "div";
type TagName = typeof TagName;
/**
 * Returns props to create a `GroupLabel` component. This hook must be used in a
 * component that's wrapped with `Group` so the `aria-labelledby` prop is
 * properly set on the group element.
 * @see https://ariakit.org/components/group
 * @example
 * ```jsx
 * // This component must be wrapped with Group
 * const props = useGroupLabel();
 * <Role {...props}>Label</Role>
 * ```
 */
export declare const useGroupLabel: import("../utils/types.ts").Hook<"div", GroupLabelOptions<"div">>;
/**
 * Renders a label in a group. This component should be wrapped with a
 * [`Group`](https://ariakit.org/reference/group) so the `aria-labelledby`
 * prop is correctly set on the group element.
 * @see https://ariakit.org/components/group
 * @example
 * ```jsx
 * <Group>
 *   <GroupLabel>Label</GroupLabel>
 * </Group>
 * ```
 */
export declare const GroupLabel: (props: GroupLabelProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface GroupLabelOptions<_T extends ElementType = TagName> extends Options {
}
export type GroupLabelProps<T extends ElementType = TagName> = Props<T, GroupLabelOptions<T>>;
export {};
