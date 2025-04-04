import type { BivariantCallback } from "@ariakit/core/utils/types";
import type { ChangeEvent, ElementType } from "react";
import type { CompositeItemOptions } from "../composite/composite-item.tsx";
import type { Props } from "../utils/types.ts";
import type { RadioStore } from "./radio-store.ts";
declare const TagName = "input";
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];
/**
 * Returns props to create a `Radio` component.
 * @see https://ariakit.org/components/radio
 * @example
 * ```jsx
 * const store = useRadioStore();
 * const props = useRadio({ store, value: "Apple" });
 * <RadioGroup store={store}>
 *   <Role {...props} render={<input />} />
 *   <Radio value="Orange" />
 * </RadioGroup>
 * ```
 */
export declare const useRadio: import("../utils/types.ts").Hook<"input", RadioOptions<"input">>;
/**
 * Renders a radio button element that's typically wrapped in a
 * [`RadioGroup`](https://ariakit.org/reference/radio-group) component.
 * @see https://ariakit.org/components/radio
 * @example
 * ```jsx {3-4}
 * <RadioProvider>
 *   <RadioGroup>
 *     <Radio value="Apple" />
 *     <Radio value="Orange" />
 *   </RadioGroup>
 * </RadioProvider>
 * ```
 */
export declare const Radio: (props: RadioProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface RadioOptions<T extends ElementType = TagName> extends CompositeItemOptions<T> {
    /**
     * Object returned by the
     * [`useRadioStore`](https://ariakit.org/reference/use-radio-store) hook. If
     * not provided, the closest
     * [`RadioGroup`](https://ariakit.org/reference/radio-group) or
     * [`RadioProvider`](https://ariakit.org/reference/radio-provider) components'
     * context will be used.
     */
    store?: RadioStore;
    /**
     * The value of the radio button.
     *
     * Live examples:
     * - [FormRadio](https://ariakit.org/examples/form-radio)
     * - [MenuItemRadio](https://ariakit.org/examples/menu-item-radio)
     */
    value: string | number;
    /**
     * The native `name` attribute.
     */
    name?: string;
    /**
     * Determines if the radio button is checked. Using this prop will make the
     * radio button controlled and override the
     * [`value`](https://ariakit.org/reference/radio-provider#value) state.
     */
    checked?: boolean;
    /**
     * Callback function that is called when the radio button state changes.
     */
    onChange?: BivariantCallback<(event: ChangeEvent<HTMLType>) => void>;
}
export type RadioProps<T extends ElementType = TagName> = Props<T, RadioOptions<T>>;
export {};
