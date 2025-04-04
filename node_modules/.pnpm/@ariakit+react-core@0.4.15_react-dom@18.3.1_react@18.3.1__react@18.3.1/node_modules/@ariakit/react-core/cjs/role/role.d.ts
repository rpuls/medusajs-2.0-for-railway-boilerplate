import type { ElementType, FC } from "react";
import type { Options, Props } from "../utils/types.ts";
declare const TagName = "div";
type TagName = typeof TagName;
declare const elements: readonly ["a", "button", "details", "dialog", "div", "form", "h1", "h2", "h3", "h4", "h5", "h6", "header", "img", "input", "label", "li", "nav", "ol", "p", "section", "select", "span", "summary", "textarea", "ul", "svg"];
type RoleElements = {
    [K in (typeof elements)[number]]: FC<RoleProps<K>>;
};
/**
 * Returns props to create a `Role` component.
 * @see https://ariakit.org/components/role
 * @example
 * ```jsx
 * const props = useRole();
 * <Role {...props} />
 * ```
 */
export declare const useRole: import("../utils/types.ts").Hook<"div", RoleOptions<"div">>;
/**
 * Renders an abstract element that supports the `render` prop and a
 * `wrapElement` prop that can be used to wrap the underlying element with React
 * Portal, Context or other component types.
 * @see https://ariakit.org/components/role
 * @example
 * ```jsx
 * <Role render={<div />} />
 * ```
 */
export declare const Role: FC<RoleProps<"div">> & RoleElements;
export interface RoleOptions<_T extends ElementType = TagName> extends Options {
}
export type RoleProps<T extends ElementType = TagName> = Props<T, RoleOptions<T>>;
export {};
