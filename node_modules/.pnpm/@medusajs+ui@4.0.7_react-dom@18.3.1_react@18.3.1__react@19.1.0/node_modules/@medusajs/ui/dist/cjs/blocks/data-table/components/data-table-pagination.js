"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataTablePagination = void 0;
const tslib_1 = require("tslib");
const React = tslib_1.__importStar(require("react"));
const use_data_table_context_1 = require("../../data-table/context/use-data-table-context");
const skeleton_1 = require("../../../components/skeleton");
const table_1 = require("../../../components/table");
/**
 * This component adds a pagination component and functionality to the data table.
 */
const DataTablePagination = (props) => {
    const { instance } = (0, use_data_table_context_1.useDataTableContext)();
    if (!instance.enablePagination) {
        throw new Error("DataTable.Pagination was rendered but pagination is not enabled. Make sure to pass pagination to 'useDataTable'");
    }
    if (instance.showSkeleton) {
        return React.createElement(DataTablePaginationSkeleton, null);
    }
    return (React.createElement(table_1.Table.Pagination, { translations: props.translations, className: "flex-shrink-0", canNextPage: instance.getCanNextPage(), canPreviousPage: instance.getCanPreviousPage(), pageCount: instance.getPageCount(), count: instance.rowCount, nextPage: instance.nextPage, previousPage: instance.previousPage, pageIndex: instance.pageIndex, pageSize: instance.pageSize }));
};
exports.DataTablePagination = DataTablePagination;
DataTablePagination.displayName = "DataTable.Pagination";
const DataTablePaginationSkeleton = () => {
    return (React.createElement("div", null,
        React.createElement("div", { className: "flex items-center justify-between p-4" },
            React.createElement(skeleton_1.Skeleton, { className: "h-7 w-[138px]" }),
            React.createElement("div", { className: "flex items-center gap-x-2" },
                React.createElement(skeleton_1.Skeleton, { className: "h-7 w-24" }),
                React.createElement(skeleton_1.Skeleton, { className: "h-7 w-11" }),
                React.createElement(skeleton_1.Skeleton, { className: "h-7 w-11" })))));
};
//# sourceMappingURL=data-table-pagination.js.map