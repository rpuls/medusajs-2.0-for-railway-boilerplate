import type { ElementType, HTMLAttributes } from "react";
import type { DialogOptions } from "../dialog/dialog.tsx";
import type { Props } from "../utils/types.ts";
import type { PopoverStore } from "./popover-store.ts";
declare const TagName = "div";
type TagName = typeof TagName;
interface AnchorRect {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
}
/**
 * Returns props to create a `Popover` component.
 * @see https://ariakit.org/components/popover
 * @example
 * ```jsx
 * const store = usePopoverStore();
 * const props = usePopover({ store });
 * <Role {...props}>Popover</Role>
 * ```
 */
export declare const usePopover: import("../utils/types.ts").Hook<"div", PopoverOptions<"div">>;
/**
 * Renders a popover element that's automatically positioned relative to an
 * anchor element.
 * @see https://ariakit.org/components/popover
 * @example
 * ```jsx {3}
 * <PopoverProvider>
 *   <PopoverDisclosure>Disclosure</PopoverDisclosure>
 *   <Popover>Popover</Popover>
 * </PopoverProvider>
 * ```
 */
export declare const Popover: (props: PopoverProps<"div">) => import("react/jsx-runtime").JSX.Element | null;
export interface PopoverOptions<T extends ElementType = TagName> extends DialogOptions<T> {
    /**
     * Object returned by the
     * [`usePopoverStore`](https://ariakit.org/reference/use-popover-store) hook.
     * If not provided, the closest
     * [`PopoverProvider`](https://ariakit.org/reference/popover-provider)
     * component's context will be used.
     */
    store?: PopoverStore;
    /**
     * Props that will be passed to the popover wrapper element. This element will
     * be used to position the popover.
     *
     * Live examples:
     * - [Navigation Menubar](https://ariakit.org/examples/menubar-navigation)
     * - [Sliding Menu](https://ariakit.org/examples/menu-slide)
     */
    wrapperProps?: HTMLAttributes<HTMLDivElement>;
    /**
     * Whether the popover has `position: fixed` or not.
     * @default false
     */
    fixed?: boolean;
    /**
     * The distance between the popover and the anchor element.
     *
     * Live examples:
     * - [Combobox filtering](https://ariakit.org/examples/combobox-filtering)
     * - [Form with Select](https://ariakit.org/examples/form-select)
     * - [Hovercard with keyboard support](https://ariakit.org/examples/hovercard-disclosure)
     * - [MenuItemRadio](https://ariakit.org/examples/menu-item-radio)
     * - [Submenu](https://ariakit.org/examples/menu-nested)
     * - [Toolbar with Select](https://ariakit.org/examples/toolbar-select)
     * @default 0
     */
    gutter?: number;
    /**
     * The skidding of the popover along the anchor element. Can be set to
     * negative values to make the popover shift to the opposite side.
     *
     * Live examples:
     * - [Combobox with Tabs](https://ariakit.org/examples/combobox-tabs)
     * - [Navigation Menubar](https://ariakit.org/examples/menubar-navigation)
     * - [Submenu](https://ariakit.org/examples/menu-nested)
     * - [Menubar](https://ariakit.org/components/menubar)
     * - [Select with Combobox and
     *   Tabs](https://ariakit.org/examples/select-combobox-tab)
     * @default 0
     */
    shift?: number;
    /**
     * Controls the behavior of the popover when it overflows the viewport:
     * - If a `boolean`, specifies whether the popover should flip to the opposite
     *   side when it overflows.
     * - If a `string`, indicates the preferred fallback placements when it
     *   overflows. The placements must be spaced-delimited, e.g. "top left".
     *
     * Live examples:
     * - [Sliding Menu](https://ariakit.org/examples/menu-slide)
     * - [Menubar](https://ariakit.org/components/menubar)
     * @default true
     */
    flip?: boolean | string;
    /**
     * Whether the popover should slide when it overflows.
     * @default true
     */
    slide?: boolean;
    /**
     * Whether the popover can overlap the anchor element when it overflows.
     *
     * Live examples:
     * - [Menubar](https://ariakit.org/components/menubar)
     * - [Submenu with
     *   Combobox](https://ariakit.org/examples/menu-nested-combobox)
     * @default false
     */
    overlap?: boolean;
    /**
     * Whether the popover should have the same width as the anchor element. This
     * will be exposed to CSS as
     * [`--popover-anchor-width`](https://ariakit.org/guide/styling#--popover-anchor-width).
     * @default false
     */
    sameWidth?: boolean;
    /**
     * Whether the popover should fit the viewport. If this is set to true, the
     * popover wrapper will have `maxWidth` and `maxHeight` set to the viewport
     * size. This will be exposed to CSS as
     * [`--popover-available-width`](https://ariakit.org/guide/styling#--popover-available-width)
     * and
     * [`--popover-available-height`](https://ariakit.org/guide/styling#--popover-available-height).
     *
     * Live examples:
     * - [Textarea with inline
     *   Combobox](https://ariakit.org/examples/combobox-textarea)
     * - [Menubar](https://ariakit.org/components/menubar)
     * @default false
     */
    fitViewport?: boolean;
    /**
     * The minimum padding between the arrow and the popover corner.
     * @default 4
     */
    arrowPadding?: number;
    /**
     * The minimum padding between the popover and the viewport edge. This will be
     * exposed to CSS as
     * [`--popover-overflow-padding`](https://ariakit.org/guide/styling#--popover-overflow-padding).
     *
     * Live examples:
     * - [Sliding Menu](https://ariakit.org/examples/menu-slide)
     * @default 8
     */
    overflowPadding?: number;
    /**
     * Function that returns the anchor element's DOMRect. If this is explicitly
     * passed, it will override the anchor `getBoundingClientRect` method.
     *
     * Live examples:
     *  - [Textarea with inline combobox](https://ariakit.org/examples/combobox-textarea)
     *  - [Standalone Popover](https://ariakit.org/examples/popover-standalone)
     *  - [Context menu](https://ariakit.org/examples/menu-context-menu)
     *  - [Selection Popover](https://ariakit.org/examples/popover-selection)
     */
    getAnchorRect?: (anchor: HTMLElement | null) => AnchorRect | null;
    /**
     * A callback that will be called when the popover needs to calculate its
     * position. This will override the internal `updatePosition` function. The
     * original `updatePosition` function will be passed as an argument, so it can
     * be called inside the callback to apply the default behavior.
     *
     * Live examples:
     *  - [Responsive Popover](https://ariakit.org/examples/popover-responsive)
     */
    updatePosition?: (props: {
        updatePosition: () => Promise<void>;
    }) => void | Promise<void>;
}
export type PopoverProps<T extends ElementType = TagName> = Props<T, PopoverOptions<T>>;
export {};
