import type { ComponentPropsWithoutRef, ElementType } from "react";
import type { CommandOptions } from "../command/command.tsx";
import type { Props } from "../utils/types.ts";
import type { CheckboxStore } from "./checkbox-store.ts";
declare const TagName = "input";
type TagName = typeof TagName;
/**
 * Returns props to create a `Checkbox` component. If the element is not a
 * native checkbox, the hook will return additional props to make sure it's
 * accessible.
 * @see https://ariakit.org/components/checkbox
 * @example
 * ```jsx
 * const props = useCheckbox({ render: <div /> });
 * <Role {...props}>Accessible checkbox</Role>
 * ```
 */
export declare const useCheckbox: import("../utils/types.ts").Hook<"input", CheckboxOptions<"input">>;
/**
 * Renders an accessible checkbox element. If the underlying element is not a
 * native checkbox, this component will pass additional attributes to make sure
 * it's accessible.
 * @see https://ariakit.org/components/checkbox
 * @example
 * ```jsx
 * <Checkbox render={<div />}>Accessible checkbox</Checkbox>
 * ```
 */
export declare const Checkbox: (props: CheckboxProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface CheckboxOptions<T extends ElementType = TagName> extends CommandOptions<T> {
    /**
     * Object returned by the
     * [`useCheckboxStore`](https://ariakit.org/reference/use-checkbox-store)
     * hook. If not provided, the closest
     * [`CheckboxProvider`](https://ariakit.org/reference/checkbox-provider)
     * component's context will be used. Otherwise, the component will fall back
     * to an internal store.
     *
     * Live examples:
     * - [Checkbox as button](https://ariakit.org/examples/checkbox-as-button)
     */
    store?: CheckboxStore;
    /**
     * The native `name` attribute.
     *
     * Live examples:
     * - [MenuItemCheckbox](https://ariakit.org/examples/menu-item-checkbox)
     */
    name?: string;
    /**
     * The value of the checkbox. This is useful when the same checkbox store is
     * used for multiple [`Checkbox`](https://ariakit.org/reference/checkbox)
     * elements, in which case the value will be an array of checked values.
     *
     * Live examples:
     * - [Checkbox group](https://ariakit.org/examples/checkbox-group)
     * - [MenuItemCheckbox](https://ariakit.org/examples/menu-item-checkbox)
     * @example
     * ```jsx "value"
     * <CheckboxProvider defaultValue={["Apple", "Orange"]}>
     *   <Checkbox value="Apple" />
     *   <Checkbox value="Orange" />
     *   <Checkbox value="Watermelon" />
     * </CheckboxProvider>
     * ```
     */
    value?: ComponentPropsWithoutRef<TagName>["value"];
    /**
     * The default checked state of the checkbox. This prop is ignored if the
     * [`checked`](https://ariakit.org/reference/checkbox#checked) or the
     * [`store`](https://ariakit.org/reference/checkbox#store) props are provided.
     */
    defaultChecked?: "mixed" | boolean;
    /**
     * The checked state of the checkbox. This will override the value inferred
     * from [`store`](https://ariakit.org/reference/checkbox#store) prop, if
     * provided. This can be `"mixed"` to indicate that the checkbox is partially
     * checked.
     */
    checked?: "mixed" | boolean;
    /**
     * A function that is called when the checkbox's checked state changes.
     */
    onChange?: ComponentPropsWithoutRef<TagName>["onChange"];
}
export type CheckboxProps<T extends ElementType = TagName> = Props<T, CheckboxOptions<T>>;
export {};
