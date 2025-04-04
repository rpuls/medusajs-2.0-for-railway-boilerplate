import type { PickRequired } from "@ariakit/core/utils/types";
import type { ReactElement, ReactNode } from "react";
import type { ComboboxStoreProps, ComboboxStoreSelectedValue } from "./combobox-store.ts";
type Value = ComboboxStoreSelectedValue;
/**
 * Provides a combobox store that controls the state of
 * [Combobox](https://ariakit.org/components/combobox) components.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx
 * <ComboboxProvider defaultValue="">
 *   <Combobox />
 *   <ComboboxPopover>
 *     <ComboboxItem value="Apple" />
 *     <ComboboxItem value="Banana" />
 *     <ComboboxItem value="Orange" />
 *   </ComboboxPopover>
 * </ComboboxProvider>
 * ```
 */
export declare function ComboboxProvider<T extends Value = Value>(props: PickRequired<ComboboxProviderProps<T>, "selectedValue" | "defaultSelectedValue">): ReactElement;
export declare function ComboboxProvider(props?: ComboboxProviderProps): ReactElement;
export interface ComboboxProviderProps<T extends Value = Value> extends ComboboxStoreProps<T> {
    children?: ReactNode;
}
export {};
