import { GridCollection as _GridCollection1, GridNode, GridRow } from "@react-types/grid";
import { Key } from "@react-types/shared";
import { MultipleSelectionState, MultipleSelectionStateProps, SelectionManager } from "@react-stately/selection";
export interface GridState<T, C extends _GridCollection1<T>> {
    collection: C;
    /** A set of keys for rows that are disabled. */
    disabledKeys: Set<Key>;
    /** A selection manager to read and update row selection state. */
    selectionManager: SelectionManager;
    /** Whether keyboard navigation is disabled, such as when the arrow keys should be handled by a component within a cell. */
    isKeyboardNavigationDisabled: boolean;
}
export interface GridStateOptions<T, C extends _GridCollection1<T>> extends MultipleSelectionStateProps {
    collection: C;
    disabledKeys?: Iterable<Key>;
    focusMode?: 'row' | 'cell';
    /** @private - do not use unless you know what you're doing. */
    UNSAFE_selectionState?: MultipleSelectionState;
}
/**
 * Provides state management for a grid component. Handles row selection and focusing a grid cell's focusable child if applicable.
 */
export function useGridState<T extends object, C extends _GridCollection1<T>>(props: GridStateOptions<T, C>): GridState<T, C>;
interface GridCollectionOptions<T> {
    columnCount: number;
    items: GridRow<T>[];
    visitNode?: (cell: GridNode<T>) => GridNode<T>;
}
export class GridCollection<T> implements _GridCollection1<T> {
    keyMap: Map<Key, GridNode<T>>;
    columnCount: number;
    rows: GridNode<T>[];
    constructor(opts: GridCollectionOptions<T>);
    [Symbol.iterator](): Generator<GridNode<T>, void, undefined>;
    get size(): number;
    getKeys(): IterableIterator<Key>;
    getKeyBefore(key: Key): Key | null;
    getKeyAfter(key: Key): Key | null;
    getFirstKey(): Key | null;
    getLastKey(): Key | null;
    getItem(key: Key): GridNode<T> | null;
    at(idx: number): GridNode<T> | null;
    getChildren(key: Key): Iterable<GridNode<T>>;
}

//# sourceMappingURL=types.d.ts.map
