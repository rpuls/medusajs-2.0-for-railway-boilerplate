import * as React from "react";
import { UseDataTableReturn } from "../use-data-table";
type DataTableContextProviderProps<TData> = {
    instance: UseDataTableReturn<TData>;
    children: React.ReactNode;
};
declare const DataTableContextProvider: <TData>({ instance, children, }: DataTableContextProviderProps<TData>) => React.JSX.Element;
export { DataTableContextProvider };
//# sourceMappingURL=data-table-context-provider.d.ts.map