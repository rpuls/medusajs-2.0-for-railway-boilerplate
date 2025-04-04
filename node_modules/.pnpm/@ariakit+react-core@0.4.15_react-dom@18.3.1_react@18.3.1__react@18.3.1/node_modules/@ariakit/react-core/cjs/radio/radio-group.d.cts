import type { ElementType } from "react";
import type { CompositeOptions } from "../composite/composite.tsx";
import type { Props } from "../utils/types.ts";
import type { RadioStore } from "./radio-store.ts";
declare const TagName = "div";
type TagName = typeof TagName;
/**
 * Returns props to create a `RadioGroup` component.
 * @see https://ariakit.org/components/radio
 * @example
 * ```jsx
 * const store = useRadioStore();
 * const props = useRadioGroup({ store });
 * <Role {...props}>
 *   <Radio value="Apple" />
 *   <Radio value="Orange" />
 * </Role>
 * ```
 */
export declare const useRadioGroup: import("../utils/types.ts").Hook<"div", RadioGroupOptions<"div">>;
/**
 * Renders a [`radiogroup`](https://w3c.github.io/aria/#radiogroup) element that
 * manages a group of [`Radio`](https://ariakit.org/reference/radio) elements.
 * @see https://ariakit.org/components/radio
 * @example
 * ```jsx
 * <RadioProvider>
 *   <RadioGroup>
 *     <Radio value="Apple" />
 *     <Radio value="Orange" />
 *   </RadioGroup>
 * </RadioProvider>
 * ```
 */
export declare const RadioGroup: (props: RadioGroupProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface RadioGroupOptions<T extends ElementType = TagName> extends CompositeOptions<T> {
    /**
     * Object returned by the
     * [`useRadioStore`](https://ariakit.org/reference/use-radio-store) hook. If
     * not provided, the closest
     * [`RadioProvider`](https://ariakit.org/reference/radio-provider) component's
     * context will be used.
     */
    store?: RadioStore;
}
export type RadioGroupProps<T extends ElementType = TagName> = Props<T, RadioGroupOptions<T>>;
export {};
