"use client";
import * as React from "react";
import { DataTableFilter } from "../../data-table/components/data-table-filter";
import { useDataTableContext } from "../../data-table/context/use-data-table-context";
import { Button } from "../../../components/button";
import { Skeleton } from "../../../components/skeleton";
const DataTableFilterBar = ({ clearAllFiltersLabel = "Clear all", }) => {
    const { instance } = useDataTableContext();
    const filterState = instance.getFiltering();
    const clearFilters = React.useCallback(() => {
        instance.clearFilters();
    }, [instance]);
    const filterCount = Object.keys(filterState).length;
    if (filterCount === 0) {
        return null;
    }
    if (instance.showSkeleton) {
        return React.createElement(DataTableFilterBarSkeleton, { filterCount: filterCount });
    }
    return (React.createElement("div", { className: "bg-ui-bg-subtle flex w-full flex-nowrap items-center gap-2 overflow-x-auto border-t px-6 py-2 md:flex-wrap" },
        Object.entries(filterState).map(([id, filter]) => (React.createElement(DataTableFilter, { key: id, id: id, filter: filter }))),
        filterCount > 0 ? (React.createElement(Button, { variant: "transparent", size: "small", className: "text-ui-fg-muted hover:text-ui-fg-subtle flex-shrink-0 whitespace-nowrap", type: "button", onClick: clearFilters }, clearAllFiltersLabel)) : null));
};
DataTableFilterBar.displayName = "DataTable.FilterBar";
const DataTableFilterBarSkeleton = ({ filterCount, }) => {
    return (React.createElement("div", { className: "bg-ui-bg-subtle flex w-full flex-nowrap items-center gap-2 overflow-x-auto border-t px-6 py-2 md:flex-wrap" },
        Array.from({ length: filterCount }).map((_, index) => (React.createElement(Skeleton, { key: index, className: "h-7 w-[180px]" }))),
        filterCount > 0 ? React.createElement(Skeleton, { className: "h-7 w-[66px]" }) : null));
};
export { DataTableFilterBar };
//# sourceMappingURL=data-table-filter-bar.js.map