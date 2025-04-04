import * as React from "react";
import { DataTableContext } from "./data-table-context";
const useDataTableContext = () => {
    const context = React.useContext(DataTableContext);
    if (!context) {
        throw new Error("useDataTableContext must be used within a DataTableContextProvider");
    }
    return context;
};
export { useDataTableContext };
//# sourceMappingURL=use-data-table-context.js.map