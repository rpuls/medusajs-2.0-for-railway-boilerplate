"use client";
import { Input } from "../../../components/input";
import { Skeleton } from "../../../components/skeleton";
import { clx } from "../../../utils/clx";
import * as React from "react";
import { useDataTableContext } from "../../data-table/context/use-data-table-context";
/**
 * This component adds a search input to the data table, allowing users
 * to search through the table's data.
 */
const DataTableSearch = (props) => {
    const { className, ...rest } = props;
    const { instance } = useDataTableContext();
    if (!instance.enableSearch) {
        throw new Error("DataTable.Search was rendered but search is not enabled. Make sure to pass search to 'useDataTable'");
    }
    if (instance.showSkeleton) {
        return React.createElement(DataTableSearchSkeleton, null);
    }
    return (React.createElement(Input, { size: "small", type: "search", value: instance.getSearch(), onChange: (e) => instance.onSearchChange(e.target.value), className: clx({
            "pr-[calc(15px+2px+8px)]": instance.isLoading,
        }, className), ...rest }));
};
DataTableSearch.displayName = "DataTable.Search";
const DataTableSearchSkeleton = () => {
    return React.createElement(Skeleton, { className: "h-7 w-[128px]" });
};
export { DataTableSearch };
//# sourceMappingURL=data-table-search.js.map