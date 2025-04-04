import type { ElementType } from "react";
import type { CheckboxCheckOptions } from "../checkbox/checkbox-check.tsx";
import type { Props } from "../utils/types.ts";
import type { MenuStore } from "./menu-store.ts";
declare const TagName = "span";
type TagName = typeof TagName;
/**
 * Returns props to create a `MenuItemCheck` component.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const props = useMenuItemCheck({ checked: true });
 * <Role {...props} />
 * ```
 */
export declare const useMenuItemCheck: import("../utils/types.ts").Hook<"span", MenuItemCheckOptions<"span">>;
/**
 * Renders a checkmark icon when the
 * [`checked`](https://ariakit.org/reference/menu-item-check#checked) prop is
 * `true`. The icon can be overridden by providing a different one as children.
 *
 * When rendered inside
 * [`MenuItemCheckbox`](https://ariakit.org/reference/menu-item-checkbox) or
 * [`MenuItemRadio`](https://ariakit.org/reference/menu-item-radio) components,
 * the [`checked`](https://ariakit.org/reference/menu-item-check#checked) prop
 * is automatically derived from the context.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx {5,9}
 * <MenuProvider defaultValues={{ apple: true, orange: false }}>
 *   <MenuButton>Fruits</MenuButton>
 *   <Menu>
 *     <MenuItemCheckbox name="apple">
 *       <MenuItemCheck />
 *       Apple
 *     </MenuItemCheckbox>
 *     <MenuItemCheckbox name="orange">
 *       <MenuItemCheck />
 *       Orange
 *     </MenuItemCheckbox>
 *   </Menu>
 * </MenuProvider>
 * ```
 */
export declare const MenuItemCheck: (props: MenuItemCheckProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface MenuItemCheckOptions<T extends ElementType = TagName> extends Omit<CheckboxCheckOptions<T>, "store"> {
    /**
     * Object returned by the
     * [`useMenuStore`](https://ariakit.org/reference/use-menu-store) hook.
     */
    store?: MenuStore;
}
export type MenuItemCheckProps<T extends ElementType = TagName> = Props<T, MenuItemCheckOptions<T>>;
export {};
