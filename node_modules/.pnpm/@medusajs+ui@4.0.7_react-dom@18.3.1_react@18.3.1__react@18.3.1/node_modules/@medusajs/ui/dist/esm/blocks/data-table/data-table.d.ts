import * as React from "react";
import { UseDataTableReturn } from "./use-data-table";
/**
 * The props of the `DataTable` component.
 */
interface DataTableProps<TData> {
    /**
     * The instance returned by the `useDataTable` hook.
     */
    instance: UseDataTableReturn<TData>;
    /**
     * The children of the component.
     */
    children?: React.ReactNode;
    /**
     * Additional classes to pass to the wrapper `div` of the component.
     */
    className?: string;
}
declare const DataTable: {
    <TData>({ instance, children, className, }: DataTableProps<TData>): React.JSX.Element;
    displayName: string;
} & {
    Table: {
        (props: import("./components/data-table-table").DataTableTableProps): React.JSX.Element;
        displayName: string;
    };
    Toolbar: (props: import("./components/data-table-toolbar").DataTableToolbarProps) => React.JSX.Element;
    Search: {
        (props: import("./components/data-table-search").DataTableSearchProps): React.JSX.Element;
        displayName: string;
    };
    SortingMenu: {
        (props: import("./components/data-table-sorting-menu").DataTableSortingMenuProps): React.JSX.Element;
        displayName: string;
    };
    FilterMenu: {
        (props: import("./components/data-table-filter-menu").DataTableFilterMenuProps): React.JSX.Element;
        displayName: string;
    };
    Pagination: {
        (props: import("./components/data-table-pagination").DataTablePaginationProps): React.JSX.Element;
        displayName: string;
    };
    CommandBar: {
        (props: import("./components/data-table-command-bar").DataTableCommandBarProps): React.JSX.Element | null;
        displayName: string;
    };
};
export { DataTable };
export type { DataTableProps };
//# sourceMappingURL=data-table.d.ts.map