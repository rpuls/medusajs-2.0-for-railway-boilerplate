"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDataTableContext = void 0;
const tslib_1 = require("tslib");
const React = tslib_1.__importStar(require("react"));
const data_table_context_1 = require("./data-table-context");
const useDataTableContext = () => {
    const context = React.useContext(data_table_context_1.DataTableContext);
    if (!context) {
        throw new Error("useDataTableContext must be used within a DataTableContextProvider");
    }
    return context;
};
exports.useDataTableContext = useDataTableContext;
//# sourceMappingURL=use-data-table-context.js.map