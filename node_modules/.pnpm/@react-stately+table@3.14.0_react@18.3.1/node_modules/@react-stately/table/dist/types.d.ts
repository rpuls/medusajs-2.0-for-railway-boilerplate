import { ColumnSize, TableCollection as _TableCollection1, TableBodyProps, TableHeaderProps, ColumnProps, RowProps, CellProps } from "@react-types/table";
import { GridNode } from "@react-types/grid";
import { Key, Node, SelectionMode, Sortable, SortDescriptor } from "@react-types/shared";
import { GridCollection, GridState } from "@react-stately/grid";
import { MultipleSelectionState, MultipleSelectionStateProps } from "@react-stately/selection";
import { ReactElement, JSX } from "react";
interface TableColumnLayoutOptions<T> {
    getDefaultWidth?: (column: GridNode<T>) => ColumnSize | null | undefined;
    getDefaultMinWidth?: (column: GridNode<T>) => ColumnSize | null | undefined;
}
export class TableColumnLayout<T> {
    getDefaultWidth: (column: GridNode<T>) => ColumnSize | null | undefined;
    getDefaultMinWidth: (column: GridNode<T>) => ColumnSize | null | undefined;
    columnWidths: Map<Key, number>;
    columnMinWidths: Map<Key, number>;
    columnMaxWidths: Map<Key, number>;
    constructor(options: TableColumnLayoutOptions<T>);
    /** Takes an array of columns and splits it into 2 maps of columns with controlled and columns with uncontrolled widths. */
    splitColumnsIntoControlledAndUncontrolled(columns: Array<GridNode<T>>): [Map<Key, GridNode<T>>, Map<Key, GridNode<T>>];
    /** Takes uncontrolled and controlled widths and joins them into a single Map. */
    recombineColumns(columns: Array<GridNode<T>>, uncontrolledWidths: Map<Key, ColumnSize>, uncontrolledColumns: Map<Key, GridNode<T>>, controlledColumns: Map<Key, GridNode<T>>): Map<Key, ColumnSize>;
    /** Used to make an initial Map of the uncontrolled widths based on default widths. */
    getInitialUncontrolledWidths(uncontrolledColumns: Map<Key, GridNode<T>>): Map<Key, ColumnSize>;
    getColumnWidth(key: Key): number;
    getColumnMinWidth(key: Key): number;
    getColumnMaxWidth(key: Key): number;
    resizeColumnWidth(collection: _TableCollection1<T>, uncontrolledWidths: Map<Key, ColumnSize>, col: Key, width: number): Map<Key, ColumnSize>;
    buildColumnWidths(tableWidth: number, collection: _TableCollection1<T>, widths: Map<Key, ColumnSize>): Map<Key, number>;
}
interface GridCollectionOptions {
    showSelectionCheckboxes?: boolean;
    showDragButtons?: boolean;
}
/** @private */
export function buildHeaderRows<T>(keyMap: Map<Key, GridNode<T>>, columnNodes: GridNode<T>[]): GridNode<T>[];
export class TableCollection<T> extends GridCollection<T> implements _TableCollection1<T> {
    headerRows: GridNode<T>[];
    columns: GridNode<T>[];
    rowHeaderColumnKeys: Set<Key>;
    body: GridNode<T>;
    _size: number;
    constructor(nodes: Iterable<GridNode<T>>, prev?: _TableCollection1<T> | null, opts?: GridCollectionOptions);
    [Symbol.iterator](): Generator<Node<T>, void, undefined>;
    get size(): number;
    getKeys(): IterableIterator<Key>;
    getKeyBefore(key: Key): Key | null;
    getKeyAfter(key: Key): Key | null;
    getFirstKey(): Key | null;
    getLastKey(): Key | null;
    getItem(key: Key): GridNode<T> | null;
    at(idx: number): GridNode<T> | null;
    getChildren(key: Key): Iterable<GridNode<T>>;
    getTextValue(key: Key): string;
}
export interface TableState<T> extends GridState<T, _TableCollection1<T>> {
    /** A collection of rows and columns in the table. */
    collection: _TableCollection1<T>;
    /** Whether the row selection checkboxes should be displayed. */
    showSelectionCheckboxes: boolean;
    /** The current sorted column and direction. */
    sortDescriptor: SortDescriptor | null;
    /** Calls the provided onSortChange handler with the provided column key and sort direction. */
    sort(columnKey: Key, direction?: 'ascending' | 'descending'): void;
    /** Whether keyboard navigation is disabled, such as when the arrow keys should be handled by a component within a cell. */
    isKeyboardNavigationDisabled: boolean;
    /** Set whether keyboard navigation is disabled, such as when the arrow keys should be handled by a component within a cell. */
    setKeyboardNavigationDisabled: (val: boolean) => void;
}
export interface CollectionBuilderContext<T> {
    showSelectionCheckboxes: boolean;
    showDragButtons: boolean;
    selectionMode: SelectionMode;
    columns: Node<T>[];
}
export interface TableStateProps<T> extends MultipleSelectionStateProps, Sortable {
    /** The elements that make up the table. Includes the TableHeader, TableBody, Columns, and Rows. */
    children?: [ReactElement<TableHeaderProps<T>>, ReactElement<TableBodyProps<T>>];
    /** A list of row keys to disable. */
    disabledKeys?: Iterable<Key>;
    /** A pre-constructed collection to use instead of building one from items and children. */
    collection?: _TableCollection1<T>;
    /** Whether the row selection checkboxes should be displayed. */
    showSelectionCheckboxes?: boolean;
    /** Whether the row drag button should be displayed.
     * @private
     */
    showDragButtons?: boolean;
    /** @private - do not use unless you know what you're doing. */
    UNSAFE_selectionState?: MultipleSelectionState;
}
/**
 * Provides state management for a table component. Handles building a collection
 * of columns and rows from props. In addition, it tracks row selection and manages sort order changes.
 */
export function useTableState<T extends object>(props: TableStateProps<T>): TableState<T>;
export interface TableColumnResizeStateProps<T> {
    /**
     * Current width of the table or table viewport that the columns
     * should be calculated against.
     */
    tableWidth: number;
    /** A function that is called to find the default width for a given column. */
    getDefaultWidth?: (node: GridNode<T>) => ColumnSize | null | undefined;
    /** A function that is called to find the default minWidth for a given column. */
    getDefaultMinWidth?: (node: GridNode<T>) => ColumnSize | null | undefined;
}
export interface TableColumnResizeState<T> {
    /**
     * Called to update the state that a resize event has occurred.
     * Returns the new widths for all columns based on the resized column.
     */
    updateResizedColumns: (key: Key, width: number) => Map<Key, ColumnSize>;
    /** Callback for when onColumnResize has started. */
    startResize: (key: Key) => void;
    /** Callback for when onColumnResize has ended. */
    endResize: () => void;
    /** Gets the current width for the specified column. */
    getColumnWidth: (key: Key) => number;
    /** Gets the current minWidth for the specified column. */
    getColumnMinWidth: (key: Key) => number;
    /** Gets the current maxWidth for the specified column. */
    getColumnMaxWidth: (key: Key) => number;
    /** Key of the currently resizing column. */
    resizingColumn: Key | null;
    /** A reference to the table state. */
    tableState: TableState<T>;
    /** A map of the current column widths. */
    columnWidths: Map<Key, number>;
}
/**
 * Provides column width state management for a table component with column resizing support. Handles building
 * a map of column widths calculated from the table's width and any provided column width information from the collection.
 * In addition, it tracks the currently resizing column and provides callbacks for updating the widths upon resize operations.
 * @param props - Props for the table.
 * @param state - State for the table, as returned by `useTableState`.
 */
export function useTableColumnResizeState<T>(props: TableColumnResizeStateProps<T>, state: TableState<T>): TableColumnResizeState<T>;
export interface TreeGridState<T> extends TableState<T> {
    /** A set of keys for items that are expanded. */
    expandedKeys: 'all' | Set<Key>;
    /** Toggles the expanded state for a row by its key. */
    toggleKey(key: Key): void;
    /** The key map containing nodes representing the collection's tree grid structure. */
    keyMap: Map<Key, GridNode<T>>;
    /** The number of leaf columns provided by the user. */
    userColumnCount: number;
}
export interface TreeGridStateProps<T> extends Omit<TableStateProps<T>, 'collection'> {
    /** The currently expanded keys in the collection (controlled). */
    UNSTABLE_expandedKeys?: 'all' | Iterable<Key>;
    /** The initial expanded keys in the collection (uncontrolled). */
    UNSTABLE_defaultExpandedKeys?: 'all' | Iterable<Key>;
    /** Handler that is called when items are expanded or collapsed. */
    UNSTABLE_onExpandedChange?: (keys: Set<Key>) => any;
}
/**
 * Provides state management for a tree grid component. Handles building a collection
 * of columns and rows from props. In addition, it tracks and manages expanded rows, row selection, and sort order changes.
 */
export function UNSTABLE_useTreeGridState<T extends object>(props: TreeGridStateProps<T>): TreeGridState<T>;
/**
 * A TableHeader is a container for the Column elements in a Table. Columns can be statically defined
 * as children, or generated dynamically using a function based on the data passed to the `columns` prop.
 */
export let TableHeader: <T>(props: TableHeaderProps<T>) => JSX.Element;
/**
 * A TableBody is a container for the Row elements of a Table. Rows can be statically defined
 * as children, or generated dynamically using a function based on the data passed to the `items` prop.
 */
export let TableBody: <T>(props: TableBodyProps<T>) => JSX.Element;
/**
 * A Column represents a field of each item within a Table. Columns may also contain nested
 * Column elements to represent column groups. Nested columns can be statically defined as
 * children, or dynamically generated using a function based on the `childColumns` prop.
 */
export let Column: <T>(props: ColumnProps<T>) => JSX.Element;
/**
 * A Row represents a single item in a Table and contains Cell elements for each column.
 * Cells can be statically defined as children, or generated dynamically using a function
 * based on the columns defined in the TableHeader.
 */
export let Row: <T>(props: RowProps<T>) => JSX.Element;
/**
 * A Cell represents the value of a single Column within a Table Row.
 */
export let Cell: (props: CellProps) => JSX.Element;
export type { TableHeaderProps, TableBodyProps, ColumnProps, RowProps, CellProps } from '@react-types/table';
export { Section } from '@react-stately/collections';

//# sourceMappingURL=types.d.ts.map
