import { Collection, Key, Node, CollectionStateBase, DisabledBehavior, Expandable, MultipleSelection } from "@react-types/shared";
import { SelectionManager } from "@react-stately/selection";
export class TreeCollection<T> implements Collection<Node<T>> {
    constructor(nodes: Iterable<Node<T>>, { expandedKeys }?: {
        expandedKeys?: Set<Key>;
    });
    [Symbol.iterator](): Generator<Node<T>, void, undefined>;
    get size(): number;
    getKeys(): IterableIterator<Key>;
    getKeyBefore(key: Key): Key | null;
    getKeyAfter(key: Key): Key | null;
    getFirstKey(): Key | null;
    getLastKey(): Key | null;
    getItem(key: Key): Node<T> | null;
    at(idx: number): Node<T> | null;
}
export interface TreeProps<T> extends CollectionStateBase<T>, Expandable, MultipleSelection {
    /** Whether `disabledKeys` applies to all interactions, or only selection. */
    disabledBehavior?: DisabledBehavior;
}
export interface TreeState<T> {
    /** A collection of items in the tree. */
    readonly collection: Collection<Node<T>>;
    /** A set of keys for items that are disabled. */
    readonly disabledKeys: Set<Key>;
    /** A set of keys for items that are expanded. */
    readonly expandedKeys: Set<Key>;
    /** Toggles the expanded state for an item by its key. */
    toggleKey(key: Key): void;
    /** Replaces the set of expanded keys. */
    setExpandedKeys(keys: Set<Key>): void;
    /** A selection manager to read and update multiple selection state. */
    readonly selectionManager: SelectionManager;
}
/**
 * Provides state management for tree-like components. Handles building a collection
 * of items from props, item expanded state, and manages multiple selection state.
 */
export function useTreeState<T extends object>(props: TreeProps<T>): TreeState<T>;

//# sourceMappingURL=types.d.ts.map
