"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataTableContextProvider = void 0;
const tslib_1 = require("tslib");
const React = tslib_1.__importStar(require("react"));
const data_table_context_1 = require("./data-table-context");
const DataTableContextProvider = ({ instance, children, }) => {
    return (React.createElement(data_table_context_1.DataTableContext.Provider, { value: { instance } }, children));
};
exports.DataTableContextProvider = DataTableContextProvider;
//# sourceMappingURL=data-table-context-provider.js.map