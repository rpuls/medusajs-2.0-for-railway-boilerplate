import type { ElementType } from "react";
import type { Options, Props } from "../utils/types.ts";
import type { CheckboxStore } from "./checkbox-store.ts";
declare const TagName = "span";
type TagName = typeof TagName;
/**
 * Returns props to create a `CheckboxCheck` component, that's usually rendered
 * inside a `Checkbox` component.
 * @see https://ariakit.org/components/checkbox
 * @example
 * ```jsx
 * const props = useCheckboxCheck({ checked: true });
 * <Role {...props} />
 * ```
 */
export declare const useCheckboxCheck: import("../utils/types.ts").Hook<"span", CheckboxCheckOptions<"span">>;
/**
 * Renders a checkmark icon when the
 * [`checked`](https://ariakit.org/reference/checkbox-check#checked) prop is
 * `true`. The icon can be overridden by providing a different one as children.
 *
 * When rendered inside a [`Checkbox`](https://ariakit.org/reference/checkbox)
 * component, the
 * [`checked`](https://ariakit.org/reference/checkbox-check#checked) prop is
 * automatically derived from the context.
 * @see https://ariakit.org/components/checkbox
 * @example
 * ```jsx
 * <CheckboxCheck checked />
 * ```
 */
export declare const CheckboxCheck: (props: CheckboxCheckProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface CheckboxCheckOptions<_T extends ElementType = TagName> extends Options {
    /**
     * Object returned by the
     * [`useCheckboxStore`](https://ariakit.org/reference/use-checkbox-store)
     * hook.
     */
    store?: CheckboxStore;
    /**
     * Determines if the checkmark should be rendered. This value is automatically
     * derived from the context when it exists. Manually setting this prop will
     * supersede the derived value.
     *
     * Live examples:
     * - [Submenu with
     *   Combobox](https://ariakit.org/examples/menu-nested-combobox)
     */
    checked?: boolean;
}
export type CheckboxCheckProps<T extends ElementType = TagName> = Props<T, CheckboxCheckOptions<T>>;
export {};
