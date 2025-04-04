import type { Store as CoreStore, State, StoreState } from "@ariakit/core/utils/store";
import type { PickByValue, SetState } from "@ariakit/core/utils/types";
export interface UseState<S> {
    /**
     * Re-renders the component when state changes and returns the current state.
     * @deprecated Use
     * [`useStoreState`](https://ariakit.org/reference/use-store-state) instead.
     * @example
     * const state = store.useState();
     */
    (): S;
    /**
     * Re-renders the component when the state changes and returns the current
     * state given the passed key. Changes on other keys will not trigger a
     * re-render.
     * @param key The state key.
     * @deprecated Use
     * [`useStoreState`](https://ariakit.org/reference/use-store-state) instead.
     * @example
     * const foo = store.useState("foo");
     */
    <K extends keyof S>(key: K): S[K];
    /**
     * Re-renders the component when the state changes given the return value of
     * the selector function. The selector should return a stable value that will
     * be compared to the previous value. Returns the value returned by the
     * selector function.
     * @param selector The selector function.
     * @deprecated Use
     * [`useStoreState`](https://ariakit.org/reference/use-store-state) instead.
     * @example
     * const foo = store.useState((state) => state.foo);
     */
    <V>(selector: (state: S) => V): V;
}
type StateStore<T = CoreStore> = T | null | undefined;
type StateKey<T = CoreStore> = keyof StoreState<T>;
/**
 * Receives an Ariakit store object (which can be `null` or `undefined`) and
 * returns the current state. If a key is provided as the second argument, it
 * returns the value of that key. If a selector function is provided, the state
 * is passed to it, and its return value is used.
 *
 * The component using this hook will re-render when the returned value changes.
 * @example
 * Accessing the whole combobox state:
 * ```js
 * const combobox = Ariakit.useComboboxStore();
 * const state = Ariakit.useStoreState(combobox);
 * ```
 * @example
 * Accessing a specific value from the combobox state:
 * ```js
 * const combobox = Ariakit.useComboboxStore();
 * const value = Ariakit.useStoreState(combobox, "value");
 * ```
 * @example
 * Accessing a value using a selector function:
 * ```js
 * const combobox = Ariakit.useComboboxStore();
 * const value = Ariakit.useStoreState(combobox, (state) => state.value);
 * ```
 * @example
 * Accessing the state of a store that may be `null` or `undefined` (for
 * example, using a context):
 * ```js
 * const combobox = Ariakit.useComboboxContext();
 * const value = Ariakit.useStoreState(combobox, "value");
 * ```
 */
export declare function useStoreState<T extends CoreStore>(store: T): StoreState<T>;
export declare function useStoreState<T extends CoreStore>(store: StateStore<T>): StoreState<T> | undefined;
export declare function useStoreState<T extends CoreStore, K extends StateKey<T>>(store: T, key: K): StoreState<T>[K];
export declare function useStoreState<T extends CoreStore, K extends StateKey<T>>(store: StateStore<T>, key: K): StoreState<T>[K] | undefined;
export declare function useStoreState<T extends CoreStore, V>(store: T, selector: (state: StoreState<T>) => V): V;
export declare function useStoreState<T extends CoreStore, V>(store: StateStore<T>, selector: (state?: StoreState<T>) => V): V;
type StoreStateObject<T extends StateStore, S extends StoreState<T> | undefined> = Record<string, StateKey<T> | ((state: S) => any)>;
type StoreStateObjectResult<T extends StateStore, S extends StoreState<T> | undefined, O extends StoreStateObject<T, S>> = {
    [K in keyof O]: O[K] extends keyof StoreState<T> ? O[K] extends keyof S ? S[O[K]] : StoreState<T>[O[K]] | undefined : O[K] extends (state: S) => infer R ? R : never;
};
/**
 * Receives an Ariakit store object (which can be `null` or `undefined`) and
 * returns the current state. Unlike `useStoreState`, this hook receives an
 * object with keys that map to store keys or selector functions.
 */
export declare function useStoreStateObject<T extends CoreStore, O extends StoreStateObject<T, StoreState<T>>>(store: T, object: O): StoreStateObjectResult<T, StoreState<T>, O>;
export declare function useStoreStateObject<T extends StateStore, O extends StoreStateObject<T, StoreState<T> | undefined>>(store: T, object: O): StoreStateObjectResult<T, StoreState<T> | undefined, O>;
/**
 * Synchronizes the store with the props, including parent store props.
 * @param store The store to synchronize.
 * @param props The props to synchronize with.
 * @param key The key of the value prop.
 * @param setKey The key of the setValue prop.
 */
export declare function useStoreProps<S extends State, P extends Partial<S>, K extends keyof S, SK extends keyof PickByValue<P, SetState<P[K]>>>(store: CoreStore<S>, props: P, key: K, setKey?: SK): void;
/**
 * Creates a React store from a core store object and returns a tuple with the
 * store and a function to update the store.
 * @param createStore A function that receives the props and returns a core
 * store object.
 * @param props The props to pass to the createStore function.
 */
export declare function useStore<T extends CoreStore, P>(createStore: (props: P) => T, props: P): readonly [T & {
    useState: UseState<StoreState<T>>;
}, () => void];
export type Store<T extends CoreStore = CoreStore> = T & {
    /**
     * Re-renders the component when the state changes and returns the current
     * state.
     * @deprecated Use
     * [`useStoreState`](https://ariakit.org/reference/use-store-state) instead.
     */
    useState: UseState<StoreState<T>>;
};
export {};
