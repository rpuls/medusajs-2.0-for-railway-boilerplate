import { Key, Selection, LoadingState, SortDescriptor } from "@react-types/shared";
export interface ListOptions<T> {
    /** Initial items in the list. */
    initialItems?: T[];
    /** The keys for the initially selected items. */
    initialSelectedKeys?: 'all' | Iterable<Key>;
    /** The initial text to filter the list by. */
    initialFilterText?: string;
    /** A function that returns a unique key for an item object. */
    getKey?: (item: T) => Key;
    /** A function that returns whether a item matches the current filter text. */
    filter?: (item: T, filterText: string) => boolean;
}
export interface ListData<T> {
    /** The items in the list. */
    items: T[];
    /** The keys of the currently selected items in the list. */
    selectedKeys: Selection;
    /** Sets the selected keys. */
    setSelectedKeys(keys: Selection): void;
    /** The current filter text. */
    filterText: string;
    /** Sets the filter text. */
    setFilterText(filterText: string): void;
    /**
     * Gets an item from the list by key.
     * @param key - The key of the item to retrieve.
     */
    getItem(key: Key): T | undefined;
    /**
     * Inserts items into the list at the given index.
     * @param index - The index to insert into.
     * @param values - The values to insert.
     */
    insert(index: number, ...values: T[]): void;
    /**
     * Inserts items into the list before the item at the given key.
     * @param key - The key of the item to insert before.
     * @param values - The values to insert.
     */
    insertBefore(key: Key, ...values: T[]): void;
    /**
     * Inserts items into the list after the item at the given key.
     * @param key - The key of the item to insert after.
     * @param values - The values to insert.
     */
    insertAfter(key: Key, ...values: T[]): void;
    /**
     * Appends items to the list.
     * @param values - The values to insert.
     */
    append(...values: T[]): void;
    /**
     * Prepends items to the list.
     * @param value - The value to insert.
     */
    prepend(...values: T[]): void;
    /**
     * Removes items from the list by their keys.
     * @param keys - The keys of the item to remove.
     */
    remove(...keys: Key[]): void;
    /**
     * Removes all items from the list that are currently
     * in the set of selected items.
     */
    removeSelectedItems(): void;
    /**
     * Moves an item within the list.
     * @param key - The key of the item to move.
     * @param toIndex - The index to move the item to.
     */
    move(key: Key, toIndex: number): void;
    /**
     * Moves one or more items before a given key.
     * @param key - The key of the item to move the items before.
     * @param keys - The keys of the items to move.
     */
    moveBefore(key: Key, keys: Iterable<Key>): void;
    /**
     * Moves one or more items after a given key.
     * @param key - The key of the item to move the items after.
     * @param keys - The keys of the items to move.
     */
    moveAfter(key: Key, keys: Iterable<Key>): void;
    /**
     * Updates an item in the list.
     * @param key - The key of the item to update.
     * @param newValue - The new value for the item.
     */
    update(key: Key, newValue: T): void;
}
/**
 * Manages state for an immutable list data structure, and provides convenience methods to
 * update the data over time.
 */
export function useListData<T>(options: ListOptions<T>): ListData<T>;
export interface AsyncListOptions<T, C> {
    /** The keys for the initially selected items. */
    initialSelectedKeys?: Iterable<Key>;
    /** The initial sort descriptor. */
    initialSortDescriptor?: SortDescriptor;
    /** The initial filter text. */
    initialFilterText?: string;
    /** A function that returns a unique key for an item object. */
    getKey?: (item: T) => Key;
    /** A function that loads the data for the items in the list. */
    load: AsyncListLoadFunction<T, C>;
    /**
     * An optional function that performs sorting. If not provided,
     * then `sortDescriptor` is passed to the `load` function.
     */
    sort?: AsyncListLoadFunction<T, C, AsyncListLoadOptions<T, C> & {
        sortDescriptor: SortDescriptor;
    }>;
}
type AsyncListLoadFunction<T, C, S extends AsyncListLoadOptions<T, C> = AsyncListLoadOptions<T, C>> = (state: S) => AsyncListStateUpdate<T, C> | Promise<AsyncListStateUpdate<T, C>>;
interface AsyncListLoadOptions<T, C> {
    /** The items currently in the list. */
    items: T[];
    /** The keys of the currently selected items in the list. */
    selectedKeys: Selection;
    /** The current sort descriptor for the list. */
    sortDescriptor?: SortDescriptor;
    /** An abort signal used to notify the load function that the request has been aborted. */
    signal: AbortSignal;
    /** The pagination cursor returned from the last page load. */
    cursor?: C;
    /** The current filter text used to perform server side filtering. */
    filterText?: string;
    /** The current loading state of the list. */
    loadingState?: LoadingState;
}
interface AsyncListStateUpdate<T, C> {
    /** The new items to append to the list. */
    items: Iterable<T>;
    /** The keys to add to the selection. */
    selectedKeys?: Iterable<Key>;
    /** The sort descriptor to set. */
    sortDescriptor?: SortDescriptor;
    /** The pagination cursor to be used for the next page load. */
    cursor?: C;
    /** The updated filter text for the list. */
    filterText?: string;
}
export interface AsyncListData<T> extends ListData<T> {
    /** Whether data is currently being loaded. */
    isLoading: boolean;
    /** If loading data failed, then this contains the error that occurred. */
    error?: Error;
    /** The current sort descriptor for the list. */
    sortDescriptor?: SortDescriptor;
    /** Reloads the data in the list. */
    reload(): void;
    /** Loads the next page of data in the list. */
    loadMore(): void;
    /** Triggers sorting for the list. */
    sort(descriptor: SortDescriptor): void;
    /** The current loading state for the list. */
    loadingState: LoadingState;
}
/**
 * Manages state for an immutable async loaded list data structure, and provides convenience methods to
 * update the data over time. Manages loading and error states, pagination, and sorting.
 */
export function useAsyncList<T, C = string>(options: AsyncListOptions<T, C>): AsyncListData<T>;
export interface TreeOptions<T extends object> {
    /** Initial root items in the tree. */
    initialItems?: T[];
    /** The keys for the initially selected items. */
    initialSelectedKeys?: Iterable<Key>;
    /** A function that returns a unique key for an item object. */
    getKey?: (item: T) => Key;
    /** A function that returns the children for an item object. */
    getChildren?: (item: T) => T[];
}
interface TreeNode<T extends object> {
    /** A unique key for the tree node. */
    key: Key;
    /** The key of the parent node. */
    parentKey?: Key | null;
    /** The value object for the tree node. */
    value: T;
    /** Children of the tree node. */
    children: TreeNode<T>[] | null;
}
export interface TreeData<T extends object> {
    /** The root nodes in the tree. */
    items: TreeNode<T>[];
    /** The keys of the currently selected items in the tree. */
    selectedKeys: Set<Key>;
    /** Sets the selected keys. */
    setSelectedKeys(keys: Set<Key>): void;
    /**
     * Gets a node from the tree by key.
     * @param key - The key of the item to retrieve.
     */
    getItem(key: Key): TreeNode<T> | undefined;
    /**
     * Inserts an item into a parent node as a child.
     * @param parentKey - The key of the parent item to insert into. `null` for the root.
     * @param index - The index within the parent to insert into.
     * @param value - The value to insert.
     */
    insert(parentKey: Key | null, index: number, ...values: T[]): void;
    /**
     * Inserts items into the list before the item at the given key.
     * @param key - The key of the item to insert before.
     * @param values - The values to insert.
     */
    insertBefore(key: Key, ...values: T[]): void;
    /**
     * Inserts items into the list after the item at the given key.
     * @param key - The key of the item to insert after.
     * @param values - The values to insert.
     */
    insertAfter(key: Key, ...values: T[]): void;
    /**
     * Appends an item into a parent node as a child.
     * @param parentKey - The key of the parent item to insert into. `null` for the root.
     * @param value - The value to insert.
     */
    append(parentKey: Key | null, ...values: T[]): void;
    /**
     * Prepends an item into a parent node as a child.
     * @param parentKey - The key of the parent item to insert into. `null` for the root.
     * @param value - The value to insert.
     */
    prepend(parentKey: Key | null, ...value: T[]): void;
    /**
     * Removes an item from the tree by its key.
     * @param key - The key of the item to remove.
     */
    remove(...keys: Key[]): void;
    /**
     * Removes all items from the tree that are currently
     * in the set of selected items.
     */
    removeSelectedItems(): void;
    /**
     * Moves an item within the tree.
     * @param key - The key of the item to move.
     * @param toParentKey - The key of the new parent to insert into. `null` for the root.
     * @param index - The index within the new parent to insert at.
     */
    move(key: Key, toParentKey: Key | null, index: number): void;
    /**
     * Updates an item in the tree.
     * @param key - The key of the item to update.
     * @param newValue - The new value for the item.
     */
    update(key: Key, newValue: T): void;
}
/**
 * Manages state for an immutable tree data structure, and provides convenience methods to
 * update the data over time.
 */
export function useTreeData<T extends object>(options: TreeOptions<T>): TreeData<T>;

//# sourceMappingURL=types.d.ts.map
