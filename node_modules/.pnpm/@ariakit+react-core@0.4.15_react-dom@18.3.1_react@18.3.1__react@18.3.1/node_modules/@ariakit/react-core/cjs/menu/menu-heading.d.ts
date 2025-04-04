import type { ElementType } from "react";
import type { HovercardHeadingOptions } from "../hovercard/hovercard-heading.tsx";
import type { Props } from "../utils/types.ts";
import type { MenuStore } from "./menu-store.ts";
declare const TagName = "h1";
type TagName = typeof TagName;
/**
 * Returns props to create a `MenuHeading` component. This hook must be used in
 * a component that's wrapped with `Menu` so the `aria-labelledby` prop is
 * properly set on the menu element.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * // This component must be wrapped with Menu
 * const props = useMenuHeading();
 * <Role {...props}>Heading</Role>
 * ```
 */
export declare const useMenuHeading: import("../utils/types.ts").Hook<"h1", MenuHeadingOptions<"h1">>;
/**
 * Renders a heading in a menu. This component must be wrapped within
 * [`Menu`](https://ariakit.org/reference/menu) so the `aria-labelledby` prop is
 * properly set on the content element.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * <MenuProvider>
 *   <Menu>
 *     <MenuHeading>Heading</MenuHeading>
 *   </Menu>
 * </MenuProvider>
 * ```
 */
export declare const MenuHeading: (props: MenuHeadingProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface MenuHeadingOptions<T extends ElementType = TagName> extends HovercardHeadingOptions<T> {
    /**
     * Object returned by the
     * [`useMenuStore`](https://ariakit.org/reference/use-menu-store) hook. If not
     * provided, the closest [`Menu`](https://ariakit.org/reference/menu) or
     * [`MenuProvider`](https://ariakit.org/reference/menu-provider) components'
     * context will be used.
     */
    store?: MenuStore;
}
export type MenuHeadingProps<T extends ElementType = TagName> = Props<T, MenuHeadingOptions<T>>;
export {};
