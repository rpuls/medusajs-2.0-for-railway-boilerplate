import type { DataTableCellContext, DataTableHeaderContext } from "../../data-table/types";
import * as React from "react";
interface DataTableSelectCellProps<TData> {
    ctx: DataTableCellContext<TData, unknown>;
}
declare const DataTableSelectCell: {
    <TData>(props: DataTableSelectCellProps<TData>): React.JSX.Element;
    displayName: string;
};
interface DataTableSelectHeaderProps<TData> {
    ctx: DataTableHeaderContext<TData, unknown>;
}
declare const DataTableSelectHeader: <TData>(props: DataTableSelectHeaderProps<TData>) => React.JSX.Element;
export { DataTableSelectCell, DataTableSelectHeader };
export type { DataTableSelectCellProps, DataTableSelectHeaderProps };
//# sourceMappingURL=data-table-select-cell.d.ts.map