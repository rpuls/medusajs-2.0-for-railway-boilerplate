import * as React from "react";
import { CellContext } from "@tanstack/react-table";
interface DataTableActionCellProps<TData> {
    ctx: CellContext<TData, unknown>;
}
declare const DataTableActionCell: {
    <TData>({ ctx, }: DataTableActionCellProps<TData>): React.JSX.Element | null;
    displayName: string;
};
export { DataTableActionCell };
export type { DataTableActionCellProps };
//# sourceMappingURL=data-table-action-cell.d.ts.map