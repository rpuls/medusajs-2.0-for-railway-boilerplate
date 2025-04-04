import { DataTableFilterBar } from "../../data-table/components/data-table-filter-bar";
import { clx } from "../../../utils/clx";
import * as React from "react";
/**
 * Toolbar shown for the data table.
 */
const DataTableToolbar = (props) => {
    var _a;
    return (React.createElement("div", { className: "flex flex-col divide-y" },
        React.createElement("div", { className: clx("flex items-center px-6 py-4", props.className) }, props.children),
        React.createElement(DataTableFilterBar, { clearAllFiltersLabel: (_a = props.translations) === null || _a === void 0 ? void 0 : _a.clearAll })));
};
export { DataTableToolbar };
//# sourceMappingURL=data-table-toolbar.js.map