"use client";
import * as React from "react";
import { useDataTableContext } from "../../data-table/context/use-data-table-context";
import { Skeleton } from "../../../components/skeleton";
import { Table } from "../../../components/table";
/**
 * This component adds a pagination component and functionality to the data table.
 */
const DataTablePagination = (props) => {
    const { instance } = useDataTableContext();
    if (!instance.enablePagination) {
        throw new Error("DataTable.Pagination was rendered but pagination is not enabled. Make sure to pass pagination to 'useDataTable'");
    }
    if (instance.showSkeleton) {
        return React.createElement(DataTablePaginationSkeleton, null);
    }
    return (React.createElement(Table.Pagination, { translations: props.translations, className: "flex-shrink-0", canNextPage: instance.getCanNextPage(), canPreviousPage: instance.getCanPreviousPage(), pageCount: instance.getPageCount(), count: instance.rowCount, nextPage: instance.nextPage, previousPage: instance.previousPage, pageIndex: instance.pageIndex, pageSize: instance.pageSize }));
};
DataTablePagination.displayName = "DataTable.Pagination";
const DataTablePaginationSkeleton = () => {
    return (React.createElement("div", null,
        React.createElement("div", { className: "flex items-center justify-between p-4" },
            React.createElement(Skeleton, { className: "h-7 w-[138px]" }),
            React.createElement("div", { className: "flex items-center gap-x-2" },
                React.createElement(Skeleton, { className: "h-7 w-24" }),
                React.createElement(Skeleton, { className: "h-7 w-11" }),
                React.createElement(Skeleton, { className: "h-7 w-11" })))));
};
export { DataTablePagination };
//# sourceMappingURL=data-table-pagination.js.map