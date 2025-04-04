"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataTable = void 0;
const tslib_1 = require("tslib");
const React = tslib_1.__importStar(require("react"));
const clx_1 = require("../../utils/clx");
const data_table_command_bar_1 = require("./components/data-table-command-bar");
const data_table_filter_menu_1 = require("./components/data-table-filter-menu");
const data_table_pagination_1 = require("./components/data-table-pagination");
const data_table_search_1 = require("./components/data-table-search");
const data_table_sorting_menu_1 = require("./components/data-table-sorting-menu");
const data_table_table_1 = require("./components/data-table-table");
const data_table_toolbar_1 = require("./components/data-table-toolbar");
const data_table_context_provider_1 = require("./context/data-table-context-provider");
/**
 * This component creates a data table with filters, pagination, sorting, and more.
 * It's built on top of the `Table` component while expanding its functionality.
 * The `DataTable` is useful to create tables similar to those in the Medusa Admin dashboard.
 */
const Root = ({ instance, children, className, }) => {
    return (React.createElement(data_table_context_provider_1.DataTableContextProvider, { instance: instance },
        React.createElement("div", { className: (0, clx_1.clx)("relative flex min-h-0 flex-1 flex-col", className) }, children)));
};
Root.displayName = "DataTable";
const DataTable = Object.assign(Root, {
    Table: data_table_table_1.DataTableTable,
    Toolbar: data_table_toolbar_1.DataTableToolbar,
    Search: data_table_search_1.DataTableSearch,
    SortingMenu: data_table_sorting_menu_1.DataTableSortingMenu,
    FilterMenu: data_table_filter_menu_1.DataTableFilterMenu,
    Pagination: data_table_pagination_1.DataTablePagination,
    CommandBar: data_table_command_bar_1.DataTableCommandBar,
});
exports.DataTable = DataTable;
//# sourceMappingURL=data-table.js.map