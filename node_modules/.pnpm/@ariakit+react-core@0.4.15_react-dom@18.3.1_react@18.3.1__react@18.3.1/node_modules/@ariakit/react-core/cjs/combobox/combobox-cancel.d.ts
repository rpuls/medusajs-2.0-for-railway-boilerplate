import type { ElementType } from "react";
import type { ButtonOptions } from "../button/button.tsx";
import type { Props } from "../utils/types.ts";
import type { ComboboxStore } from "./combobox-store.ts";
declare const TagName = "button";
type TagName = typeof TagName;
/**
 * Returns props to create a `ComboboxCancel` component that clears the combobox
 * input when clicked.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx
 * const store = useComboboxStore();
 * const props = useComboboxCancel({ store });
 * <Combobox store={store} />
 * <Role {...props} />
 * ```
 */
export declare const useComboboxCancel: import("../utils/types.ts").Hook<"button", ComboboxCancelOptions<"button">>;
/**
 * Renders a combobox cancel button that clears the combobox input value when
 * clicked.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx {3}
 * <ComboboxProvider>
 *   <Combobox />
 *   <ComboboxCancel />
 *   <ComboboxPopover>
 *     <ComboboxItem value="Apple" />
 *     <ComboboxItem value="Banana" />
 *     <ComboboxItem value="Orange" />
 *   </ComboboxPopover>
 * </ComboboxProvider>
 * ```
 */
export declare const ComboboxCancel: (props: ComboboxCancelProps) => import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>>;
export interface ComboboxCancelOptions<T extends ElementType = TagName> extends ButtonOptions<T> {
    /**
     * Object returned by the
     * [`useComboboxStore`](https://ariakit.org/reference/use-combobox-store)
     * hook. If not provided, the closest
     * [`ComboboxProvider`](https://ariakit.org/reference/combobox-provider)
     * component's context will be used.
     */
    store?: ComboboxStore;
    /**
     * When enabled, the button won't be rendered when the combobox input value is
     * empty.
     *
     * Live examples:
     * - [Combobox with Tabs](https://ariakit.org/examples/combobox-tabs)
     * @default false
     */
    hideWhenEmpty?: boolean;
}
export type ComboboxCancelProps<T extends ElementType = TagName> = Props<T, ComboboxCancelOptions<T>>;
export {};
