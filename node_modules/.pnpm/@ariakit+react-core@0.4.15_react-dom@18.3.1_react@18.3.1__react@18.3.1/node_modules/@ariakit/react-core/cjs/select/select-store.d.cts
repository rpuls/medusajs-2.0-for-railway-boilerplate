import * as Core from "@ariakit/core/select/select-store";
import type { BivariantCallback, PickRequired } from "@ariakit/core/utils/types";
import type { ComboboxStore } from "../combobox/combobox-store.ts";
import type { CompositeStoreFunctions, CompositeStoreOptions, CompositeStoreState } from "../composite/composite-store.ts";
import type { PopoverStoreFunctions, PopoverStoreOptions, PopoverStoreState } from "../popover/popover-store.ts";
import type { Store } from "../utils/store.tsx";
export declare function useSelectStoreOptions<T extends Core.SelectStoreOptions>(props: T): {
    id: string | undefined;
} & T;
export declare function useSelectStoreProps<T extends Core.SelectStore>(store: T, update: () => void, props: SelectStoreProps): T & {
    disclosure: import("../disclosure/disclosure-store.ts").DisclosureStore | null | undefined;
} & {
    combobox: ComboboxStore<import("@ariakit/core/combobox/combobox-store").ComboboxStoreSelectedValue> | null | undefined;
};
/**
 * Creates a select store to control the state of
 * [Select](https://ariakit.org/components/select) components.
 * @see https://ariakit.org/components/select
 * @example
 * ```jsx
 * const select = useSelectStore({ defaultValue: "Apple" });
 *
 * <Select store={select} />
 * <SelectPopover store={select}>
 *   <SelectItem value="Apple" />
 *   <SelectItem value="Orange" />
 * </SelectPopover>
 * ```
 */
export declare function useSelectStore<T extends SelectStoreValue = SelectStoreValue>(props: PickRequired<SelectStoreProps<T>, "value" | "defaultValue">): SelectStore<T>;
export declare function useSelectStore(props?: SelectStoreProps): SelectStore;
export type SelectStoreValue = Core.SelectStoreValue;
export interface SelectStoreItem extends Core.SelectStoreItem {
}
export interface SelectStoreState<T extends SelectStoreValue = SelectStoreValue> extends Core.SelectStoreState<T>, CompositeStoreState<SelectStoreItem>, PopoverStoreState {
}
export interface SelectStoreFunctions<T extends SelectStoreValue = SelectStoreValue> extends Pick<SelectStoreOptions<T>, "combobox" | "disclosure">, Omit<Core.SelectStoreFunctions<T>, "combobox" | "disclosure">, CompositeStoreFunctions<SelectStoreItem>, PopoverStoreFunctions {
}
export interface SelectStoreOptions<T extends SelectStoreValue = SelectStoreValue> extends Omit<Core.SelectStoreOptions<T>, "combobox" | "disclosure">, CompositeStoreOptions<SelectStoreItem>, PopoverStoreOptions {
    /**
     * Function that will be called when the
     * [`value`](https://ariakit.org/reference/select-provider#value) state
     * changes.
     *
     * Live examples:
     * - [Form with Select](https://ariakit.org/examples/form-select)
     * - [Select Grid](https://ariakit.org/examples/select-grid)
     * - [Select with custom
     *   items](https://ariakit.org/examples/select-item-custom)
     * - [Multi-Select](https://ariakit.org/examples/select-multiple)
     * - [Toolbar with Select](https://ariakit.org/examples/toolbar-select)
     * - [Select with Next.js App
     *   Router](https://ariakit.org/examples/select-next-router)
     */
    setValue?: BivariantCallback<(value: SelectStoreState<T>["value"]) => void>;
    /**
     * A reference to a [combobox
     * store](https://ariakit.org/reference/use-combobox-store). It's
     * automatically set when composing [Select with
     * Combobox](https://ariakit.org/examples/select-combobox).
     */
    combobox?: ComboboxStore | null;
}
export interface SelectStoreProps<T extends SelectStoreValue = SelectStoreValue> extends SelectStoreOptions<T>, Omit<Core.SelectStoreProps<T>, "combobox" | "disclosure"> {
}
export interface SelectStore<T extends SelectStoreValue = SelectStoreValue> extends SelectStoreFunctions<T>, Omit<Store<Core.SelectStore<T>>, "combobox" | "disclosure"> {
}
