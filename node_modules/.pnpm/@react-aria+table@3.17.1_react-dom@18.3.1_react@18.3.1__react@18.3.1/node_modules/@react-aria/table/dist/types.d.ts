import { GridAria, GridProps, GridRowAria, GridRowProps, GridRowGroupAria } from "@react-aria/grid";
import { Key, LayoutDelegate, Rect, RefObject, Size, DOMAttributes, FocusableElement } from "@react-types/shared";
import { TableState, TreeGridState, TableColumnResizeState } from "@react-stately/table";
import { GridNode } from "@react-types/grid";
import { AriaCheckboxProps } from "@react-types/checkbox";
import { ColumnSize } from "@react-types/table";
export interface AriaTableProps extends GridProps {
    /** The layout object for the table. Computes what content is visible and how to position and style them. */
    layoutDelegate?: LayoutDelegate;
    /** @deprecated - Use layoutDelegate instead. */
    layout?: DeprecatedLayout;
}
interface DeprecatedLayout {
    getLayoutInfo(key: Key): DeprecatedLayoutInfo;
    getContentSize(): Size;
    virtualizer: DeprecatedVirtualizer;
}
interface DeprecatedLayoutInfo {
    rect: Rect;
}
interface DeprecatedVirtualizer {
    visibleRect: Rect;
}
/**
 * Provides the behavior and accessibility implementation for a table component.
 * A table displays data in rows and columns and enables a user to navigate its contents via directional navigation keys,
 * and optionally supports row selection and sorting.
 * @param props - Props for the table.
 * @param state - State for the table, as returned by `useTableState`.
 * @param ref - The ref attached to the table element.
 */
export function useTable<T>(props: AriaTableProps, state: TableState<T> | TreeGridState<T>, ref: RefObject<HTMLElement | null>): GridAria;
export interface AriaTableColumnHeaderProps<T> {
    /** An object representing the [column header](https://www.w3.org/TR/wai-aria-1.1/#columnheader). Contains all the relevant information that makes up the column header. */
    node: GridNode<T>;
    /** Whether the [column header](https://www.w3.org/TR/wai-aria-1.1/#columnheader) is contained in a virtual scroller. */
    isVirtualized?: boolean;
}
export interface TableColumnHeaderAria {
    /** Props for the [column header](https://www.w3.org/TR/wai-aria-1.1/#columnheader) element. */
    columnHeaderProps: DOMAttributes;
}
/**
 * Provides the behavior and accessibility implementation for a column header in a table.
 * @param props - Props for the column header.
 * @param state - State of the table, as returned by `useTableState`.
 * @param ref - The ref attached to the column header element.
 */
export function useTableColumnHeader<T>(props: AriaTableColumnHeaderProps<T>, state: TableState<T>, ref: RefObject<FocusableElement | null>): TableColumnHeaderAria;
/**
 * Provides the behavior and accessibility implementation for a row in a table.
 * @param props - Props for the row.
 * @param state - State of the table, as returned by `useTableState`.
 */
export function useTableRow<T>(props: GridRowProps<T>, state: TableState<T> | TreeGridState<T>, ref: RefObject<FocusableElement | null>): GridRowAria;
export interface TableHeaderRowAria {
    /** Props for the grid row element. */
    rowProps: DOMAttributes;
}
/**
 * Provides the behavior and accessibility implementation for a header row in a table.
 * @param props - Props for the row.
 * @param state - State of the table, as returned by `useTableState`.
 */
export function useTableHeaderRow<T>(props: GridRowProps<T>, state: TableState<T>, ref: RefObject<Element | null>): TableHeaderRowAria;
export interface AriaTableCellProps {
    /** An object representing the table cell. Contains all the relevant information that makes up the row header. */
    node: GridNode<unknown>;
    /** Whether the cell is contained in a virtual scroller. */
    isVirtualized?: boolean;
    /** Whether selection should occur on press up instead of press down. */
    shouldSelectOnPressUp?: boolean;
    /**
     * Handler that is called when a user performs an action on the cell.
     * Please use onCellAction at the collection level instead.
     * @deprecated
     **/
    onAction?: () => void;
}
export interface TableCellAria {
    /** Props for the table cell element. */
    gridCellProps: DOMAttributes;
    /** Whether the cell is currently in a pressed state. */
    isPressed: boolean;
}
/**
 * Provides the behavior and accessibility implementation for a cell in a table.
 * @param props - Props for the cell.
 * @param state - State of the table, as returned by `useTableState`.
 * @param ref - The ref attached to the cell element.
 */
export function useTableCell<T>(props: AriaTableCellProps, state: TableState<T>, ref: RefObject<FocusableElement | null>): TableCellAria;
export interface AriaTableSelectionCheckboxProps {
    /** A unique key for the checkbox. */
    key: Key;
}
export interface TableSelectionCheckboxAria {
    /** Props for the row selection checkbox element. */
    checkboxProps: AriaCheckboxProps;
}
export interface TableSelectAllCheckboxAria {
    /** Props for the select all checkbox element. */
    checkboxProps: AriaCheckboxProps;
}
/**
 * Provides the behavior and accessibility implementation for a selection checkbox in a table.
 * @param props - Props for the selection checkbox.
 * @param state - State of the table, as returned by `useTableState`.
 */
export function useTableSelectionCheckbox<T>(props: AriaTableSelectionCheckboxProps, state: TableState<T>): TableSelectionCheckboxAria;
/**
 * Provides the behavior and accessibility implementation for the select all checkbox in a table.
 * @param props - Props for the select all checkbox.
 * @param state - State of the table, as returned by `useTableState`.
 */
export function useTableSelectAllCheckbox<T>(state: TableState<T>): TableSelectAllCheckboxAria;
export interface TableColumnResizeAria {
    /** Props for the visually hidden input element. */
    inputProps: DOMAttributes;
    /** Props for the resizer element. */
    resizerProps: DOMAttributes;
    /** Whether this column is currently being resized. */
    isResizing: boolean;
}
export interface AriaTableColumnResizeProps<T> {
    /** An object representing the [column header](https://www.w3.org/TR/wai-aria-1.1/#columnheader). Contains all the relevant information that makes up the column header. */
    column: GridNode<T>;
    /** Aria label for the hidden input. Gets read when resizing. */
    'aria-label': string;
    /**
     * Ref to the trigger if resizing was started from a column header menu. If it's provided,
     * focus will be returned there when resizing is done. If it isn't provided, it is assumed that the resizer is
     * visible at all time and keyboard resizing is started via pressing Enter on the resizer and not on focus.
     * */
    triggerRef?: RefObject<FocusableElement | null>;
    /** If resizing is disabled. */
    isDisabled?: boolean;
    /** Called when resizing starts. */
    onResizeStart?: (widths: Map<Key, ColumnSize>) => void;
    /** Called for every resize event that results in new column sizes. */
    onResize?: (widths: Map<Key, ColumnSize>) => void;
    /** Called when resizing ends. */
    onResizeEnd?: (widths: Map<Key, ColumnSize>) => void;
}
/**
 * Provides the behavior and accessibility implementation for a table column resizer element.
 * @param props - Props for the resizer.
 * @param state - State for the table's resizable columns, as returned by `useTableColumnResizeState`.
 * @param ref - The ref attached to the resizer's visually hidden input element.
 */
export function useTableColumnResize<T>(props: AriaTableColumnResizeProps<T>, state: TableColumnResizeState<T>, ref: RefObject<HTMLInputElement | null>): TableColumnResizeAria;
export function useTableRowGroup(): GridRowGroupAria;
export type { GridAria, GridRowAria, GridRowProps } from '@react-aria/grid';

//# sourceMappingURL=types.d.ts.map
