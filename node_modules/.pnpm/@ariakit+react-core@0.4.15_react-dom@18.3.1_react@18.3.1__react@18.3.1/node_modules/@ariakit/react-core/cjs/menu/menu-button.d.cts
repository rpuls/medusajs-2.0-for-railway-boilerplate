import type { ElementType } from "react";
import type { CompositeTypeaheadOptions } from "../composite/composite-typeahead.tsx";
import type { HovercardAnchorOptions } from "../hovercard/hovercard-anchor.tsx";
import type { PopoverDisclosureOptions } from "../popover/popover-disclosure.tsx";
import type { Props } from "../utils/types.ts";
import type { MenuStore } from "./menu-store.ts";
declare const TagName = "button";
type TagName = typeof TagName | "div";
/**
 * Returns props to create a `MenuButton` component.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const store = useMenuStore();
 * const props = useMenuButton({ store });
 * <Role {...props}>Edit</Role>
 * <Menu store={store}>
 *   <MenuItem>Undo</MenuItem>
 *   <MenuItem>Redo</MenuItem>
 * </Menu>
 * ```
 */
export declare const useMenuButton: import("../utils/types.ts").Hook<TagName, MenuButtonOptions<TagName>>;
/**
 * Renders a menu button that toggles the visibility of a
 * [`Menu`](https://ariakit.org/reference/menu) component when clicked or when
 * using arrow keys.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx {2}
 * <MenuProvider>
 *   <MenuButton>Edit</MenuButton>
 *   <Menu>
 *     <MenuItem>Undo</MenuItem>
 *     <MenuItem>Redo</MenuItem>
 *   </Menu>
 * </MenuProvider>
 * ```
 */
export declare const MenuButton: (props: MenuButtonProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface MenuButtonOptions<T extends ElementType = TagName> extends HovercardAnchorOptions<T>, PopoverDisclosureOptions<T>, CompositeTypeaheadOptions<T> {
    /**
     * Object returned by the
     * [`useMenuStore`](https://ariakit.org/reference/use-menu-store) hook. If not
     * provided, the closest
     * [`MenuProvider`](https://ariakit.org/reference/menu-provider) component's
     * context will be used.
     */
    store?: MenuStore;
    /**
     * Determines whether pressing a character key while focusing on the
     * [`MenuButton`](https://ariakit.org/reference/menu-button) should move focus
     * to the [`MenuItem`](https://ariakit.org/reference/menu-item) starting with
     * that character.
     *
     * By default, it's `true` for menu buttons in a
     * [`Menubar`](https://ariakit.org/reference/menubar), but `false` for other
     * menu buttons.
     */
    typeahead?: boolean;
}
export type MenuButtonProps<T extends ElementType = TagName> = Props<T, MenuButtonOptions<T>>;
export {};
