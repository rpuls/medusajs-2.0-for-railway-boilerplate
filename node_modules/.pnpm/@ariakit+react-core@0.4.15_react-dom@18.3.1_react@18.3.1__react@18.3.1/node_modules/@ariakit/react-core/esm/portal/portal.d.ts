import type { ElementType, MutableRefObject, RefCallback } from "react";
import type { Options, Props } from "../utils/types.ts";
declare const TagName = "div";
type TagName = typeof TagName;
/**
 * Returns props to create a `Portal` component.
 * @see https://ariakit.org/components/portal
 * @example
 * ```jsx
 * const props = usePortal();
 * <Role {...props}>Content</Role>
 * ```
 */
export declare const usePortal: import("../utils/types.ts").Hook<"div", PortalOptions<"div">>;
/**
 * Renders an element using [React
 * Portal](https://react.dev/reference/react-dom/createPortal).
 *
 * By default, the portal element is a `div` element appended to the
 * `document.body` element. You can customize this with the
 * [`portalElement`](https://ariakit.org/reference/portal#portalelement) prop.
 *
 * The
 * [`preserveTabOrder`](https://ariakit.org/reference/portal#preservetaborder)
 * prop allows this component to manage the tab order of the elements. It
 * ensures the tab order remains consistent with the original location where the
 * portal was rendered in the React tree, instead of the final location in the
 * DOM. The
 * [`preserveTabOrderAnchor`](https://ariakit.org/reference/portal#preservetaborderanchor)
 * prop can specify a different location from which the tab order is preserved.
 * @see https://ariakit.org/components/portal
 * @example
 * ```jsx
 * <Portal>Content</Portal>
 * ```
 */
export declare const Portal: (props: PortalProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface PortalOptions<_T extends ElementType = TagName> extends Options {
    /**
     * When enabled, `preserveTabOrder` will keep the DOM element's tab order the
     * same as the order in which the underlying
     * [`Portal`](https://ariakit.org/reference/portal) component was mounted in
     * the React tree.
     *
     * If the
     * [`preserveTabOrderAnchor`](https://ariakit.org/reference/portal#preservetaborderanchor)
     * prop is provided, the tab order will be preserved relative to that element.
     * @default false
     */
    preserveTabOrder?: boolean;
    /**
     * An anchor element for maintaining the tab order when
     * [`preserveTabOrder`](https://ariakit.org/reference/portal#preservetaborder)
     * prop is enabled. The tab order will be kept relative to this element.
     *
     * By default, the tab order is kept relative to the original location in the
     * React tree where the underlying
     * [`Portal`](https://ariakit.org/reference/portal) component was mounted.
     * @example
     * ```jsx {18-20}
     * const [anchor, setAnchor] = useState(null);
     *
     * <button ref={setAnchor}>Order 0</button>
     * <button>Order 2</button>
     *
     * // Rendered at the end of the document.
     * <Portal>
     *   <button>Order 5</button>
     * </Portal>
     *
     * // Rendered at the end of the document, but the tab order is preserved.
     * <Portal preserveTabOrder>
     *   <button>Order 3</button>
     * </Portal>
     *
     * // Rendered at the end of the document, but the tab order is preserved
     * // relative to the anchor element.
     * <Portal preserveTabOrder preserveTabOrderAnchor={anchor}>
     *   <button>Order 1</button>
     * </Portal>
     *
     * <button>Order 4</button>
     * ```
     */
    preserveTabOrderAnchor?: Element | null;
    /**
     * `portalRef` is similar to `ref` but is scoped to the portal node. It's
     * useful when you need to be informed when the portal element is appended to
     * the DOM or removed from the DOM.
     *
     * Live examples:
     * - [Form with Select](https://ariakit.org/examples/form-select)
     * @example
     * ```jsx
     * const [portalElement, setPortalElement] = useState(null);
     *
     * <Portal portalRef={setPortalElement} />
     * ```
     */
    portalRef?: RefCallback<HTMLElement> | MutableRefObject<HTMLElement | null>;
    /**
     * Determines whether the element should be rendered as a React Portal.
     *
     * Live examples:
     * - [Combobox with integrated
     *   filter](https://ariakit.org/examples/combobox-filtering-integrated)
     * - [Dialog with Menu](https://ariakit.org/examples/dialog-menu)
     * - [Hovercard with keyboard
     *   support](https://ariakit.org/examples/hovercard-disclosure)
     * - [Menubar](https://ariakit.org/components/menubar)
     * - [Standalone Popover](https://ariakit.org/examples/popover-standalone)
     * - [Animated Select](https://ariakit.org/examples/select-animated)
     * @default true
     */
    portal?: boolean;
    /**
     * An HTML element or a memoized callback function that returns an HTML
     * element to be used as the portal element. By default, the portal element
     * will be a `div` element appended to the `document.body`.
     *
     * Live examples:
     * - [Navigation Menubar](https://ariakit.org/examples/menubar-navigation)
     * @example
     * ```jsx
     * const [portal, setPortal] = useState(null);
     *
     * <Portal portalElement={portal} />
     * <div ref={setPortal} />
     * ```
     * @example
     * ```jsx
     * const getPortalElement = useCallback(() => {
     *   const div = document.createElement("div");
     *   const portalRoot = document.getElementById("portal-root");
     *   portalRoot.appendChild(div);
     *   return div;
     * }, []);
     *
     * <Portal portalElement={getPortalElement} />
     * ```
     */
    portalElement?: ((element: HTMLElement) => HTMLElement | null) | HTMLElement | null;
}
export type PortalProps<T extends ElementType = TagName> = Props<T, PortalOptions<T>>;
export {};
