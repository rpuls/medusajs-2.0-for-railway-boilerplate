import type { CompositeStoreFunctions, CompositeStoreItem, CompositeStoreOptions, CompositeStoreState } from "../composite/composite-store.ts";
import type { Store, StoreOptions, StoreProps } from "../utils/store.ts";
import type { SetState } from "../utils/types.ts";
/**
 * Creates a tag store.
 */
export declare function createTagStore(props?: TagStoreProps): TagStore;
export interface TagStoreItem extends CompositeStoreItem {
    value?: string;
}
export interface TagStoreState extends CompositeStoreState<TagStoreItem> {
    /**
     * The input element.
     */
    inputElement: HTMLElement | null;
    /**
     * The label element.
     */
    labelElement: HTMLElement | null;
    /**
     * The value of the tag input.
     * @default ""
     */
    value: string;
    /**
     * The values of the selected tags.
     * @default []
     */
    values: string[];
}
export interface TagStoreFunctions extends CompositeStoreFunctions<TagStoreItem> {
    /**
     * Sets the `inputElement` state.
     */
    setInputElement: SetState<TagStoreState["inputElement"]>;
    /**
     * Sets the `labelElement` state.
     */
    setLabelElement: SetState<TagStoreState["labelElement"]>;
    /**
     * Sets the [`value`](https://ariakit.org/reference/tag-provider#value) state.
     */
    setValue: SetState<TagStoreState["value"]>;
    /**
     * Resets the [`value`](https://ariakit.org/reference/tag-provider#value)
     * state to its initial value.
     */
    resetValue: () => void;
    /**
     * Sets the [`values`](https://ariakit.org/reference/tag-provider#values) state.
     */
    setValues: SetState<TagStoreState["values"]>;
    /**
     * Add a new value to the
     * [`values`](https://ariakit.org/reference/tag-provider#values) state if it
     * doesn't already exist.
     */
    addValue: (value: string) => void;
    /**
     * Remove a value from the
     * [`values`](https://ariakit.org/reference/tag-provider#values) state.
     */
    removeValue: (value: string) => void;
}
export interface TagStoreOptions extends StoreOptions<TagStoreState, "value" | "values">, CompositeStoreOptions<TagStoreItem> {
    /**
     * The initial value of the tag input.
     * @default ""
     */
    defaultValue?: TagStoreState["value"];
    /**
     * The initial selected tag values.
     * @default []
     */
    defaultValues?: TagStoreState["values"];
}
export interface TagStoreProps extends TagStoreOptions, StoreProps<TagStoreState> {
}
export interface TagStore extends TagStoreFunctions, Store<TagStoreState> {
}
