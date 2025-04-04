import * as Core from "@ariakit/core/radio/radio-store";
import type { CompositeStoreFunctions, CompositeStoreOptions, CompositeStoreState } from "../composite/composite-store.ts";
import type { Store } from "../utils/store.tsx";
export declare function useRadioStoreProps<T extends Core.RadioStore>(store: T, update: () => void, props: RadioStoreProps): T;
/**
 * Creates a radio store to control the state of
 * [Radio](https://ariakit.org/components/radio) components.
 * @see https://ariakit.org/components/radio
 * @example
 * ```jsx
 * const radio = useRadioStore();
 *
 * <RadioGroup store={radio}>
 *   <Radio value="Apple" />
 *   <Radio value="Orange" />
 * </RadioGroup>
 * ```
 */
export declare function useRadioStore(props?: RadioStoreProps): RadioStore;
export interface RadioStoreState extends Core.RadioStoreState, CompositeStoreState {
}
export interface RadioStoreFunctions extends Core.RadioStoreFunctions, CompositeStoreFunctions {
}
export interface RadioStoreOptions extends Core.RadioStoreOptions, CompositeStoreOptions {
    /**
     * Function that will be called when the
     * [`value`](https://ariakit.org/reference/radio-provider#value) state
     * changes.
     */
    setValue?: (value: RadioStoreState["value"]) => void;
}
export interface RadioStoreProps extends RadioStoreOptions, Core.RadioStoreProps {
}
export interface RadioStore extends RadioStoreFunctions, Store<Core.RadioStore> {
}
