"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataTableToolbar = void 0;
const tslib_1 = require("tslib");
const data_table_filter_bar_1 = require("../../data-table/components/data-table-filter-bar");
const clx_1 = require("../../../utils/clx");
const React = tslib_1.__importStar(require("react"));
/**
 * Toolbar shown for the data table.
 */
const DataTableToolbar = (props) => {
    var _a;
    return (React.createElement("div", { className: "flex flex-col divide-y" },
        React.createElement("div", { className: (0, clx_1.clx)("flex items-center px-6 py-4", props.className) }, props.children),
        React.createElement(data_table_filter_bar_1.DataTableFilterBar, { clearAllFiltersLabel: (_a = props.translations) === null || _a === void 0 ? void 0 : _a.clearAll })));
};
exports.DataTableToolbar = DataTableToolbar;
//# sourceMappingURL=data-table-toolbar.js.map