import type { ElementType } from "react";
import type { Options, Props } from "../utils/types.ts";
import type { DisclosureStore } from "./disclosure-store.ts";
declare const TagName = "div";
type TagName = typeof TagName;
export declare function isHidden(mounted: boolean, hidden?: boolean | null, alwaysVisible?: boolean | null): boolean;
/**
 * Returns props to create a `DislosureContent` component.
 * @see https://ariakit.org/components/disclosure
 * @example
 * ```jsx
 * const store = useDisclosureStore();
 * const props = useDisclosureContent({ store });
 * <Disclosure store={store}>Disclosure</Disclosure>
 * <Role {...props}>Content</Role>
 * ```
 */
export declare const useDisclosureContent: import("../utils/types.ts").Hook<"div", DisclosureContentOptions<"div">>;
/**
 * Renders an element that can be shown or hidden by a
 * [`Disclosure`](https://ariakit.org/components/disclosure) component.
 * @see https://ariakit.org/components/disclosure
 * @example
 * ```jsx {3}
 * <DisclosureProvider>
 *   <Disclosure>Disclosure</Disclosure>
 *   <DisclosureContent>Content</DisclosureContent>
 * </DisclosureProvider>
 * ```
 */
export declare const DisclosureContent: ({ unmountOnHide, ...props }: DisclosureContentProps) => import("react/jsx-runtime").JSX.Element | null;
export interface DisclosureContentOptions<_T extends ElementType = TagName> extends Options {
    /**
     * Object returned by the
     * [`useDisclosureStore`](https://ariakit.org/reference/use-disclosure-store)
     * hook. If not provided, the closest
     * [`DisclosureProvider`](https://ariakit.org/reference/disclosure-provider)
     * component's context will be used.
     */
    store?: DisclosureStore;
    /**
     * Determines whether the content element should remain visible even when the
     * [`open`](https://ariakit.org/reference/disclosure-provider#open) state is
     * `false`. If this prop is set to `true`, the `hidden` prop and the `display:
     * none` style will not be applied, unless explicitly set otherwise.
     *
     * This prop is particularly useful when using third-party animation libraries
     * such as Framer Motion or React Spring, where the element needs to be
     * visible for exit animations to work.
     *
     * Live examples:
     * - [Dialog with Framer
     *   Motion](https://ariakit.org/examples/dialog-framer-motion)
     * - [Menu with Framer
     *   Motion](https://ariakit.org/examples/menu-framer-motion)
     * - [Tooltip with Framer
     *   Motion](https://ariakit.org/examples/tooltip-framer-motion)
     * - [Dialog with details &
     *   summary](https://ariakit.org/examples/dialog-details)
     * @default false
     */
    alwaysVisible?: boolean;
    /**
     * When set to `true`, the content element will be unmounted and removed from
     * the DOM when it's hidden.
     *
     * Live examples:
     * - [Navigation Menubar](https://ariakit.org/examples/menubar-navigation)
     * - [Combobox with integrated
     *   filter](https://ariakit.org/examples/combobox-filtering-integrated)
     * - [Textarea with inline
     *   Combobox](https://ariakit.org/examples/combobox-textarea)
     * - [Standalone Popover](https://ariakit.org/examples/popover-standalone)
     * - [Animated Select](https://ariakit.org/examples/select-animated)
     * - [Multi-Select](https://ariakit.org/examples/select-multiple)
     * @default false
     */
    unmountOnHide?: boolean;
}
export type DisclosureContentProps<T extends ElementType = TagName> = Props<T, DisclosureContentOptions<T>>;
export {};
