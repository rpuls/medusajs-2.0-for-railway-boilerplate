import * as Core from "@ariakit/core/combobox/combobox-store";
import type { PickRequired } from "@ariakit/core/utils/types";
import type { CompositeStoreFunctions, CompositeStoreOptions, CompositeStoreState } from "../composite/composite-store.ts";
import type { PopoverStoreFunctions, PopoverStoreOptions, PopoverStoreState } from "../popover/popover-store.ts";
import type { TagStore } from "../tag/tag-store.ts";
import type { Store } from "../utils/store.tsx";
export declare function useComboboxStoreOptions<T extends Core.ComboboxStoreOptions>(props: T): {
    id: string | undefined;
} & T;
export declare function useComboboxStoreProps<T extends Core.ComboboxStore>(store: T, update: () => void, props: ComboboxStoreProps): T & {
    disclosure: import("../disclosure/disclosure-store.ts").DisclosureStore | null | undefined;
} & {
    tag: TagStore | null | undefined;
};
/**
 * Creates a combobox store to control the state of
 * [Combobox](https://ariakit.org/components/combobox) components.
 * @see https://ariakit.org/components/combobox
 * @example
 * ```jsx
 * const combobox = useComboboxStore();
 *
 * <ComboboxProvider store={combobox}>
 *   <Combobox />
 *   <ComboboxPopover>
 *     <ComboboxItem value="Apple" />
 *     <ComboboxItem value="Banana" />
 *     <ComboboxItem value="Orange" />
 *   </ComboboxPopover>
 * </ComboboxProvider>
 * ```
 */
export declare function useComboboxStore<T extends ComboboxStoreSelectedValue = ComboboxStoreSelectedValue>(props: PickRequired<ComboboxStoreProps<T>, "selectedValue" | "defaultSelectedValue">): ComboboxStore<T>;
export declare function useComboboxStore(props?: ComboboxStoreProps): ComboboxStore;
export type ComboboxStoreSelectedValue = Core.ComboboxStoreSelectedValue;
export interface ComboboxStoreItem extends Core.ComboboxStoreItem {
}
export interface ComboboxStoreState<T extends ComboboxStoreSelectedValue = ComboboxStoreSelectedValue> extends Core.ComboboxStoreState<T>, CompositeStoreState<ComboboxStoreItem>, PopoverStoreState {
}
export interface ComboboxStoreFunctions<T extends ComboboxStoreSelectedValue = ComboboxStoreSelectedValue> extends Pick<ComboboxStoreOptions<T>, "tag">, Omit<Core.ComboboxStoreFunctions<T>, "tag" | "disclosure">, CompositeStoreFunctions<ComboboxStoreItem>, PopoverStoreFunctions {
}
export interface ComboboxStoreOptions<T extends ComboboxStoreSelectedValue = ComboboxStoreSelectedValue> extends Omit<Core.ComboboxStoreOptions<T>, "tag" | "disclosure">, CompositeStoreOptions<ComboboxStoreItem>, PopoverStoreOptions {
    /**
     * A callback that gets called when the
     * [`value`](https://ariakit.org/reference/combobox-provider#value) state
     * changes.
     *
     * Live examples:
     * - [Combobox with integrated
     *   filter](https://ariakit.org/examples/combobox-filtering-integrated)
     * - [ComboboxGroup](https://ariakit.org/examples/combobox-group)
     * - [Combobox with links](https://ariakit.org/examples/combobox-links)
     * - [Multi-selectable
     *   Combobox](https://ariakit.org/examples/combobox-multiple)
     * - [Menu with Combobox](https://ariakit.org/examples/menu-combobox)
     * - [Select with Combobox](https://ariakit.org/examples/select-combobox)
     */
    setValue?: (value: ComboboxStoreState<T>["value"]) => void;
    /**
     * A callback that's invoked when the
     * [`selectedValue`](https://ariakit.org/reference/combobox-provider#selectedvalue)
     * state changes, typically when the user selects an item. This can be used to
     * implement behavior like `onSelect` or `onItemSelect`.
     *
     * Live examples:
     * - [Multi-selectable
     *   Combobox](https://ariakit.org/examples/combobox-multiple)
     */
    setSelectedValue?: (value: ComboboxStoreState<T>["selectedValue"]) => void;
    /**
     * A reference to a [tag store](https://ariakit.org/apis/use-tag-store). It's
     * automatically set when rendering a combobox within a tag list.
     */
    tag?: TagStore | null;
}
export interface ComboboxStoreProps<T extends ComboboxStoreSelectedValue = ComboboxStoreSelectedValue> extends ComboboxStoreOptions<T>, Omit<Core.ComboboxStoreProps<T>, "tag" | "disclosure"> {
}
export interface ComboboxStore<T extends ComboboxStoreSelectedValue = ComboboxStoreSelectedValue> extends ComboboxStoreFunctions<T>, Omit<Store<Core.ComboboxStore<T>>, "tag" | "disclosure"> {
}
