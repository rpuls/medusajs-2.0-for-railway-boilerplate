import type { BooleanOrCallback } from "@ariakit/core/utils/types";
import type { ElementType, KeyboardEvent as ReactKeyboardEvent } from "react";
import type { FocusableOptions } from "../focusable/focusable.tsx";
import type { Props } from "../utils/types.ts";
import type { CompositeStore } from "./composite-store.ts";
declare const TagName = "div";
type TagName = typeof TagName;
/**
 * Returns props to create a `Composite` component.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx
 * const store = useCompositeStore();
 * const props = useComposite({ store });
 * <Role {...props}>
 *   <CompositeItem>Item 1</CompositeItem>
 *   <CompositeItem>Item 2</CompositeItem>
 * </Role>
 * ```
 */
export declare const useComposite: import("../utils/types.ts").Hook<"div", CompositeOptions<"div">>;
/**
 * Renders a composite widget.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx
 * const composite = useCompositeStore();
 * <Composite store={composite}>
 *   <CompositeItem>Item 1</CompositeItem>
 *   <CompositeItem>Item 2</CompositeItem>
 * </Composite>
 * ```
 */
export declare const Composite: (props: CompositeProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface CompositeOptions<T extends ElementType = TagName> extends FocusableOptions<T> {
    /**
     * Object returned by the
     * [`useCompositeStore`](https://ariakit.org/reference/use-composite-store)
     * hook. If not provided, the closest
     * [`CompositeProvider`](https://ariakit.org/reference/composite-provider)
     * component's context will be used.
     */
    store?: CompositeStore;
    /**
     * Determines if the component should act as a composite widget. This prop
     * needs to be set to `false` when merging various composite widgets where
     * only one should function in that manner.
     *
     * If disabled, this component will stop managing focus and keyboard
     * navigation for its items and itself. Additionally, composite ARIA
     * attributes won't be applied. These responsibilities should be taken over by
     * another composite component.
     *
     * **Note**: In most cases, this prop doesn't need to be set manually. For
     * example, when composing [Menu with
     * Combobox](https://ariakit.org/examples/menu-combobox) or [Select with
     * Combobox](https://ariakit.org/examples/select-combobox), this prop will be
     * set to `false` automatically on the
     * [`Menu`](https://ariakit.org/reference/menu) and
     * [`SelectPopover`](https://ariakit.org/reference/select-popover) components
     * so the [`Combobox`](https://ariakit.org/reference/combobox) component can
     * take over the composite widget responsibilities.
     *
     * Live examples:
     * - [Menu with Combobox](https://ariakit.org/examples/menu-combobox)
     * - [Select with Combobox](https://ariakit.org/examples/select-combobox)
     * @default true
     */
    composite?: boolean;
    /**
     * Determines whether the composite widget should move focus to an item when
     * arrow keys are pressed, given that the composite element is focused and
     * there's no active item.
     *
     * **Note**: To entirely disable focus moving within a composite widget, you
     * can use the
     * [`focusOnMove`](https://ariakit.org/reference/composite#focusonmove) prop
     * instead. If you want to control the behavior _only when arrow keys are
     * pressed_, where
     * [`focusOnMove`](https://ariakit.org/reference/composite#focusonmove) may
     * not be applicable, this prop must be set on composite items as well.
     * @default true
     * @example
     * ```jsx
     * <Composite moveOnKeyPress={false}>
     *   <CompositeItem moveOnKeyPress={false} />
     *   <CompositeItem moveOnKeyPress={false} />
     * </Composite>
     * ```
     */
    moveOnKeyPress?: BooleanOrCallback<ReactKeyboardEvent<HTMLElement>>;
    /**
     * Determines if the active composite item should receive focus (or virtual
     * focus if the
     * [`virtualFocus`](https://ariakit.org/reference/composite-provider#virtualfocus)
     * option is enabled) when moving through items. This typically happens when
     * navigating through items with arrow keys, but it can also happen when
     * calling the
     * [`move`](https://ariakit.org/reference/use-composite-store#move) method
     * directly.
     *
     * Unlike the
     * [`composite`](https://ariakit.org/reference/composite#composite-1) prop,
     * this option doesn't disable the entire composite widget behavior. It only
     * stops this component from managing focus when navigating through items.
     *
     * **Note**: If you want to control the behavior only _when arrow keys are
     * pressed_, use the
     * [`moveOnKeyPress`](https://ariakit.org/reference/composite#moveonkeypress)
     * prop instead.
     * @default true
     */
    focusOnMove?: boolean;
    /**
     * @see https://ariakit.org/reference/focusable
     */
    focusable?: FocusableOptions<T>["focusable"];
}
export type CompositeProps<T extends ElementType = TagName> = Props<T, CompositeOptions<T>>;
export {};
