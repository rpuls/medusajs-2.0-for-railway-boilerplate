import { type TableOptions, useReactTable } from "@tanstack/react-table";
import * as React from "react";
import { DataTableColumnDef, DataTableColumnFilter, DataTableCommand, DataTableDateComparisonOperator, DataTableEmptyState, DataTableFilter, DataTableFilteringState, DataTableFilterOption, DataTablePaginationState, DataTableRow, DataTableRowSelectionState, DataTableSortingState } from "./types";
interface DataTableOptions<TData> extends Pick<TableOptions<TData>, "data" | "getRowId"> {
    /**
     * The columns to use for the table.
     */
    columns: DataTableColumnDef<TData, any>[];
    /**
     * The filters which the user can apply to the table.
     */
    filters?: DataTableFilter[];
    /**
     * The commands which the user can apply to selected rows.
     */
    commands?: DataTableCommand[];
    /**
     * Whether the data for the table is currently being loaded.
     */
    isLoading?: boolean;
    /**
     * The state and callback for the filtering.
     */
    filtering?: {
        state: DataTableFilteringState;
        onFilteringChange: (state: DataTableFilteringState) => void;
    };
    /**
     * The state and callback for the row selection.
     */
    rowSelection?: {
        state: DataTableRowSelectionState;
        onRowSelectionChange: (state: DataTableRowSelectionState) => void;
        enableRowSelection?: boolean | ((row: DataTableRow<TData>) => boolean) | undefined;
    };
    /**
     * The state and callback for the sorting.
     */
    sorting?: {
        state: DataTableSortingState | null;
        onSortingChange: (state: DataTableSortingState) => void;
    };
    /**
     * The state and callback for the search, with optional debounce.
     */
    search?: {
        state: string;
        onSearchChange: (state: string) => void;
        /**
         * Debounce time in milliseconds for the search callback.
         * @default 300
         */
        debounce?: number;
    };
    /**
     * The state and callback for the pagination.
     */
    pagination?: {
        state: DataTablePaginationState;
        onPaginationChange: (state: DataTablePaginationState) => void;
    };
    /**
     * The function to execute when a row is clicked.
     */
    onRowClick?: (event: React.MouseEvent<HTMLTableRowElement, MouseEvent>, row: TData) => void;
    /**
     * The total count of rows. When working with pagination, this will be the total
     * number of rows available, not the number of rows currently being displayed.
     */
    rowCount?: number;
    /**
     * Whether the page index should be reset the filtering, sorting, or pagination changes.
     *
     * @default true
     */
    autoResetPageIndex?: boolean;
}
interface UseDataTableReturn<TData> extends Pick<ReturnType<typeof useReactTable<TData>>, "getHeaderGroups" | "getRowModel" | "getCanNextPage" | "getCanPreviousPage" | "nextPage" | "previousPage" | "getPageCount" | "getAllColumns"> {
    getSorting: () => DataTableSortingState | null;
    setSorting: (sortingOrUpdater: DataTableSortingState | ((prev: DataTableSortingState | null) => DataTableSortingState)) => void;
    getFilters: () => DataTableFilter[];
    getFilterOptions: <T extends string | string[] | DataTableDateComparisonOperator>(id: string) => DataTableFilterOption<T>[] | null;
    getFilterMeta: (id: string) => DataTableFilter | null;
    getFiltering: () => DataTableFilteringState;
    addFilter: (filter: DataTableColumnFilter) => void;
    removeFilter: (id: string) => void;
    clearFilters: () => void;
    updateFilter: (filter: DataTableColumnFilter) => void;
    getSearch: () => string;
    onSearchChange: (search: string) => void;
    getCommands: () => DataTableCommand[];
    getRowSelection: () => DataTableRowSelectionState;
    onRowClick?: (event: React.MouseEvent<HTMLTableRowElement, MouseEvent>, row: TData) => void;
    emptyState: DataTableEmptyState;
    isLoading: boolean;
    showSkeleton: boolean;
    pageIndex: number;
    pageSize: number;
    rowCount: number;
    enablePagination: boolean;
    enableFiltering: boolean;
    enableSorting: boolean;
    enableSearch: boolean;
}
declare const useDataTable: <TData>({ rowCount, filters, commands, rowSelection, sorting, filtering, pagination, search, onRowClick, autoResetPageIndex, isLoading, ...options }: DataTableOptions<TData>) => UseDataTableReturn<TData>;
export { useDataTable };
export type { DataTableOptions, UseDataTableReturn };
//# sourceMappingURL=use-data-table.d.ts.map