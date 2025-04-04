"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataTableSearch = void 0;
const tslib_1 = require("tslib");
const input_1 = require("../../../components/input");
const skeleton_1 = require("../../../components/skeleton");
const clx_1 = require("../../../utils/clx");
const React = tslib_1.__importStar(require("react"));
const use_data_table_context_1 = require("../../data-table/context/use-data-table-context");
/**
 * This component adds a search input to the data table, allowing users
 * to search through the table's data.
 */
const DataTableSearch = (props) => {
    const { className, ...rest } = props;
    const { instance } = (0, use_data_table_context_1.useDataTableContext)();
    if (!instance.enableSearch) {
        throw new Error("DataTable.Search was rendered but search is not enabled. Make sure to pass search to 'useDataTable'");
    }
    if (instance.showSkeleton) {
        return React.createElement(DataTableSearchSkeleton, null);
    }
    return (React.createElement(input_1.Input, { size: "small", type: "search", value: instance.getSearch(), onChange: (e) => instance.onSearchChange(e.target.value), className: (0, clx_1.clx)({
            "pr-[calc(15px+2px+8px)]": instance.isLoading,
        }, className), ...rest }));
};
exports.DataTableSearch = DataTableSearch;
DataTableSearch.displayName = "DataTable.Search";
const DataTableSearchSkeleton = () => {
    return React.createElement(skeleton_1.Skeleton, { className: "h-7 w-[128px]" });
};
//# sourceMappingURL=data-table-search.js.map