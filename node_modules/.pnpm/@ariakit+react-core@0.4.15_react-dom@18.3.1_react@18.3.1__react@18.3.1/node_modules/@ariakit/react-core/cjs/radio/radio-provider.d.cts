import type { ReactNode } from "react";
import type { RadioStoreProps } from "./radio-store.ts";
/**
 * Provides a radio store to [Radio](https://ariakit.org/components/radio)
 * components.
 * @see https://ariakit.org/components/radio
 * @example
 * ```jsx
 * <RadioProvider defaultValue="Apple">
 *   <RadioGroup>
 *     <Radio value="Apple" />
 *     <Radio value="Orange" />
 *   </RadioGroup>
 * </RadioProvider>
 * ```
 */
export declare function RadioProvider(props?: RadioProviderProps): import("react/jsx-runtime").JSX.Element;
export interface RadioProviderProps extends RadioStoreProps {
    children?: ReactNode;
}
