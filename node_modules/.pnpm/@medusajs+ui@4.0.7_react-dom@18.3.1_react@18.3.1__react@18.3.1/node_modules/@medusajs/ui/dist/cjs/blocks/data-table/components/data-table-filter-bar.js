"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataTableFilterBar = void 0;
const tslib_1 = require("tslib");
const React = tslib_1.__importStar(require("react"));
const data_table_filter_1 = require("../../data-table/components/data-table-filter");
const use_data_table_context_1 = require("../../data-table/context/use-data-table-context");
const button_1 = require("../../../components/button");
const skeleton_1 = require("../../../components/skeleton");
const DataTableFilterBar = ({ clearAllFiltersLabel = "Clear all", }) => {
    const { instance } = (0, use_data_table_context_1.useDataTableContext)();
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
        Object.entries(filterState).map(([id, filter]) => (React.createElement(data_table_filter_1.DataTableFilter, { key: id, id: id, filter: filter }))),
        filterCount > 0 ? (React.createElement(button_1.Button, { variant: "transparent", size: "small", className: "text-ui-fg-muted hover:text-ui-fg-subtle flex-shrink-0 whitespace-nowrap", type: "button", onClick: clearFilters }, clearAllFiltersLabel)) : null));
};
exports.DataTableFilterBar = DataTableFilterBar;
DataTableFilterBar.displayName = "DataTable.FilterBar";
const DataTableFilterBarSkeleton = ({ filterCount, }) => {
    return (React.createElement("div", { className: "bg-ui-bg-subtle flex w-full flex-nowrap items-center gap-2 overflow-x-auto border-t px-6 py-2 md:flex-wrap" },
        Array.from({ length: filterCount }).map((_, index) => (React.createElement(skeleton_1.Skeleton, { key: index, className: "h-7 w-[180px]" }))),
        filterCount > 0 ? React.createElement(skeleton_1.Skeleton, { className: "h-7 w-[66px]" }) : null));
};
//# sourceMappingURL=data-table-filter-bar.js.map