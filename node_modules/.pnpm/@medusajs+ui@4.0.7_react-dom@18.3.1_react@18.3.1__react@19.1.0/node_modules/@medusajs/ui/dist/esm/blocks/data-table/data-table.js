"use client";
import * as React from "react";
import { clx } from "../../utils/clx";
import { DataTableCommandBar } from "./components/data-table-command-bar";
import { DataTableFilterMenu } from "./components/data-table-filter-menu";
import { DataTablePagination } from "./components/data-table-pagination";
import { DataTableSearch } from "./components/data-table-search";
import { DataTableSortingMenu } from "./components/data-table-sorting-menu";
import { DataTableTable } from "./components/data-table-table";
import { DataTableToolbar } from "./components/data-table-toolbar";
import { DataTableContextProvider } from "./context/data-table-context-provider";
/**
 * This component creates a data table with filters, pagination, sorting, and more.
 * It's built on top of the `Table` component while expanding its functionality.
 * The `DataTable` is useful to create tables similar to those in the Medusa Admin dashboard.
 */
const Root = ({ instance, children, className, }) => {
    return (React.createElement(DataTableContextProvider, { instance: instance },
        React.createElement("div", { className: clx("relative flex min-h-0 flex-1 flex-col", className) }, children)));
};
Root.displayName = "DataTable";
const DataTable = Object.assign(Root, {
    Table: DataTableTable,
    Toolbar: DataTableToolbar,
    Search: DataTableSearch,
    SortingMenu: DataTableSortingMenu,
    FilterMenu: DataTableFilterMenu,
    Pagination: DataTablePagination,
    CommandBar: DataTableCommandBar,
});
export { DataTable };
//# sourceMappingURL=data-table.js.map