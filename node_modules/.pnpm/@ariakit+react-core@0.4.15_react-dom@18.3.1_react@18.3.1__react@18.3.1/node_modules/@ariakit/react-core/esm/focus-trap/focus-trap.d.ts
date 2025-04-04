import type { ElementType } from "react";
import type { Props } from "../utils/types.ts";
import type { VisuallyHiddenOptions } from "../visually-hidden/visually-hidden.tsx";
declare const TagName = "span";
type TagName = typeof TagName;
/**
 * Returns props to create a `FocusTrap` component.
 * @see https://ariakit.org/components/focus-trap
 * @example
 * ```jsx
 * const props = useFocusTrap();
 * <Role {...props} />
 * ```
 */
export declare const useFocusTrap: import("../utils/types.ts").Hook<"span", FocusTrapOptions<"span">>;
/**
 * Renders a focus trap element.
 * @see https://ariakit.org/components/focus-trap
 * @example
 * ```jsx
 * <FocusTrap onFocus={focusSomethingElse} />
 * ```
 */
export declare const FocusTrap: (props: FocusTrapProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export type FocusTrapOptions<T extends ElementType = TagName> = VisuallyHiddenOptions<T>;
export type FocusTrapProps<T extends ElementType = TagName> = Props<T, FocusTrapOptions<T>>;
export {};
