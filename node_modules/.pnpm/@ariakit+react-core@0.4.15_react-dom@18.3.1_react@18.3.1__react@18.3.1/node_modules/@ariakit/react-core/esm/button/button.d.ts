import type { ElementType } from "react";
import type { CommandOptions } from "../command/command.tsx";
import type { Props } from "../utils/types.ts";
declare const TagName = "button";
type TagName = typeof TagName;
/**
 * Returns props to create a `Button` component. If the element is not a native
 * button, the hook will return additional props to make sure it's accessible.
 * @see https://ariakit.org/components/button
 * @example
 * ```jsx
 * const props = useButton({ render: <div /> });
 * <Role {...props}>Accessible button</Role>
 * ```
 */
export declare const useButton: import("../utils/types.ts").Hook<"button", ButtonOptions<"button">>;
/**
 * Renders an accessible button element. If the underlying element is not a
 * native button, this component will pass additional attributes to make sure
 * it's accessible.
 * @see https://ariakit.org/components/button
 * @example
 * ```jsx
 * <Button>Button</Button>
 * ```
 */
export declare const Button: (props: ButtonProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface ButtonOptions<T extends ElementType = TagName> extends CommandOptions<T> {
}
export type ButtonProps<T extends ElementType = TagName> = Props<T, ButtonOptions<T>>;
export {};
