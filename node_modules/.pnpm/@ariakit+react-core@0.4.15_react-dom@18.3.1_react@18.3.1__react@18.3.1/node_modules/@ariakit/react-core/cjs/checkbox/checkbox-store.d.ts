import * as Core from "@ariakit/core/checkbox/checkbox-store";
import type { PickRequired } from "@ariakit/core/utils/types";
import type { Store } from "../utils/store.tsx";
export declare function useCheckboxStoreProps<T extends Core.CheckboxStore>(store: T, update: () => void, props: CheckboxStoreProps): T;
/**
 * Creates a checkbox store to conveniently manage a checkbox value,
 * whether it's a string, number, boolean, or an array of strings or numbers.
 * @see https://ariakit.org/components/checkbox
 * @example
 * ```jsx
 * const checkbox = useCheckboxStore({ defaultValue: true });
 * <Checkbox store={checkbox} />
 * ```
 */
export declare function useCheckboxStore<T extends CheckboxStoreValue = CheckboxStoreValue>(props: PickRequired<CheckboxStoreProps<T>, "value" | "defaultValue">): CheckboxStore<T>;
export declare function useCheckboxStore(props?: CheckboxStoreProps): CheckboxStore;
export type CheckboxStoreValue = Core.CheckboxStoreValue;
export type CheckboxStoreState<T extends CheckboxStoreValue = CheckboxStoreValue> = Core.CheckboxStoreState<T>;
export type CheckboxStoreFunctions<T extends CheckboxStoreValue = CheckboxStoreValue> = Core.CheckboxStoreFunctions<T>;
export interface CheckboxStoreOptions<T extends CheckboxStoreValue = CheckboxStoreValue> extends Core.CheckboxStoreOptions<T> {
    /**
     * A callback that gets called when the
     * [`value`](https://ariakit.org/reference/checkbox-provider#value) state
     * changes.
     * @example
     * function MyCheckbox({ value, onChange }) {
     *   const checkbox = useCheckboxStore({ value, setValue: onChange });
     * }
     */
    setValue?: (value: CheckboxStoreState<T>["value"]) => void;
}
export interface CheckboxStoreProps<T extends CheckboxStoreValue = CheckboxStoreValue> extends CheckboxStoreOptions<T>, Core.CheckboxStoreProps<T> {
}
export interface CheckboxStore<T extends CheckboxStoreValue = CheckboxStoreValue> extends CheckboxStoreFunctions<T>, Store<Core.CheckboxStore<T>> {
}
