import type { ElementType } from "react";
import type { FocusableOptions } from "../focusable/focusable.tsx";
import type { Props } from "../utils/types.ts";
declare const TagName = "button";
type TagName = typeof TagName;
/**
 * Returns props to create a `Command` component. If the element is not a native
 * clickable element (like a button), this hook will return additional props to
 * make sure it's accessible.
 * @see https://ariakit.org/components/command
 * @example
 * ```jsx
 * const props = useCommand({ render: <div /> });
 * <Role {...props}>Accessible button</Role>
 * ```
 */
export declare const useCommand: import("../utils/types.ts").Hook<"button", CommandOptions<"button">>;
/**
 * Renders a clickable element, which is a `button` by default, and inherits
 * features from the [`Focusable`](https://ariakit.org/reference/focusable)
 * component.
 *
 * If the base element isn't a native clickable one, this component will provide
 * extra attributes and event handlers to ensure accessibility. It can be
 * activated with the keyboard using the
 * [`clickOnEnter`](https://ariakit.org/reference/command#clickonenter) and
 * [`clickOnSpace`](https://ariakit.org/reference/command#clickonspace)
 * props. Both are set to `true` by default.
 * @see https://ariakit.org/components/command
 * @example
 * ```jsx
 * <Command>Button</Command>
 * ```
 */
export declare const Command: (props: CommandProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface CommandOptions<T extends ElementType = TagName> extends FocusableOptions<T> {
    /**
     * If set to `true`, pressing the enter key while this element is focused will
     * trigger a click on the element, regardless of whether it's a native button
     * or not. If this prop is set to `false`, pressing enter will not initiate a
     * click.
     * @default true
     */
    clickOnEnter?: boolean;
    /**
     * If set to `true`, pressing and releasing the space key while this element
     * is focused will trigger a click on the element, regardless of whether it's
     * a native button or not. If this prop is set to `false`, space will not
     * initiate a click.
     * @default true
     */
    clickOnSpace?: boolean;
}
export type CommandProps<T extends ElementType = TagName> = Props<T, CommandOptions<T>>;
export {};
