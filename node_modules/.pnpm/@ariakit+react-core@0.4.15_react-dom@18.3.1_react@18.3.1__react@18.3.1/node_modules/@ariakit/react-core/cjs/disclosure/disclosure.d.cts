import type { BooleanOrCallback } from "@ariakit/core/utils/types";
import type { ElementType, MouseEvent } from "react";
import type { ButtonOptions } from "../button/button.tsx";
import type { Props } from "../utils/types.ts";
import type { DisclosureStore } from "./disclosure-store.ts";
declare const TagName = "button";
type TagName = typeof TagName;
/**
 * Returns props to create a `Disclosure` component.
 * @see https://ariakit.org/components/disclosure
 * @example
 * ```jsx
 * const store = useDisclosureStore();
 * const props = useDisclosure({ store });
 * <Role {...props}>Disclosure</Role>
 * <DisclosureContent store={store}>Content</DisclosureContent>
 * ```
 */
export declare const useDisclosure: import("../utils/types.ts").Hook<"button", DisclosureOptions<"button">>;
/**
 * Renders an element that controls the visibility of a
 * [`DisclosureContent`](https://ariakit.org/reference/disclosure-content)
 * element.
 * @see https://ariakit.org/components/disclosure
 * @example
 * ```jsx {2}
 * <DisclosureProvider>
 *   <Disclosure>Disclosure</Disclosure>
 *   <DisclosureContent>Content</DisclosureContent>
 * </DisclosureProvider>
 * ```
 */
export declare const Disclosure: (props: DisclosureProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface DisclosureOptions<T extends ElementType = TagName> extends ButtonOptions<T> {
    /**
     * Object returned by the
     * [`useDisclosureStore`](https://ariakit.org/reference/use-disclosure-store)
     * hook. If not provided, the closest
     * [`DisclosureProvider`](https://ariakit.org/reference/disclosure-provider)
     * component's context will be used.
     */
    store?: DisclosureStore;
    /**
     * Determines whether
     * [`toggle`](https://ariakit.org/reference/use-disclosure-store#toggle) will
     * be called on click. This is useful if you want to handle the toggle logic
     * yourself.
     *
     * Live examples:
     * - [Navigation Menubar](https://ariakit.org/examples/menubar-navigation)
     * @default true
     */
    toggleOnClick?: BooleanOrCallback<MouseEvent<HTMLElement>>;
}
export type DisclosureProps<T extends ElementType = TagName> = Props<T, DisclosureOptions<T>>;
export {};
