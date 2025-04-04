import type { ElementType } from "react";
import type { RadioOptions } from "../radio/radio.tsx";
import type { Props } from "../utils/types.ts";
import type { MenuItemOptions } from "./menu-item.tsx";
import type { MenuStore } from "./menu-store.ts";
declare const TagName = "div";
type TagName = typeof TagName;
/**
 * Returns props to create a `MenuItemRadio` component.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx
 * const store = useMenuStore({ defaultValues: { fruit: "apple" } });
 * const apple = useMenuItemRadio({ store, name: "fruit", value: "apple" });
 * const orange = useMenuItemRadio({ store, name: "fruit", value: "orange" });
 * <MenuButton store={store}>Fruit</MenuButton>
 * <Menu store={store}>
 *   <Role {...apple}>Apple</Role>
 *   <Role {...orange}>Orange</Role>
 * </Menu>
 * ```
 */
export declare const useMenuItemRadio: import("../utils/types.ts").Hook<"div", MenuItemRadioOptions<"div">>;
/**
 * Renders a [`menuitemradio`](https://w3c.github.io/aria/#menuitemradio)
 * element within a [`Menu`](https://ariakit.org/reference/menu) component. The
 * [`name`](https://ariakit.org/reference/menu-item-radio#name) prop must be
 * provided to identify the field in the
 * [`values`](https://ariakit.org/reference/menu-provider#values) state.
 *
 * A [`MenuItemCheck`](https://ariakit.org/reference/menu-item-check) can be
 * used to render a checkmark inside this component.
 * @see https://ariakit.org/components/menu
 * @example
 * ```jsx {4-11}
 * <MenuProvider defaultValues={{ profile: "john" }}>
 *   <MenuButton>Profiles</MenuButton>
 *   <Menu>
 *     <MenuItemRadio name="profile" value="john">
 *       <MenuItemCheck />
 *       John Doe
 *     </MenuItemRadio>
 *     <MenuItemRadio name="profile" value="jane">
 *       <MenuItemCheck />
 *       Jane Doe
 *     </MenuItemRadio>
 *   </Menu>
 * </MenuProvider>
 * ```
 */
export declare const MenuItemRadio: (props: MenuItemRadioProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface MenuItemRadioOptions<T extends ElementType = TagName> extends MenuItemOptions<T>, Omit<RadioOptions<T>, "store"> {
    /**
     * Object returned by the
     * [`useMenuStore`](https://ariakit.org/reference/use-menu-store) hook. If not
     * provided, the closest [`Menu`](https://ariakit.org/reference/menu) or
     * [`MenuProvider`](https://ariakit.org/reference/menu-provider) components'
     * context will be used.
     */
    store?: MenuStore;
    /**
     * The name of the field in the
     * [`values`](https://ariakit.org/reference/menu-provider#values) state.
     *
     * Live examples:
     * - [MenuItemRadio](https://ariakit.org/examples/menu-item-radio)
     */
    name: string;
    /**
     * The controlled checked state of the element. It will set the menu
     * [`values`](https://ariakit.org/reference/menu-provider#values) state if
     * provided.
     */
    checked?: boolean;
    /**
     * The default checked state of the element. It will set the default value in
     * the menu [`values`](https://ariakit.org/reference/menu-provider#values)
     * state if provided.
     */
    defaultChecked?: boolean;
    /**
     * @default false
     */
    hideOnClick?: MenuItemOptions<T>["hideOnClick"];
}
export type MenuItemRadioProps<T extends ElementType = TagName> = Props<T, MenuItemRadioOptions<T>>;
export {};
