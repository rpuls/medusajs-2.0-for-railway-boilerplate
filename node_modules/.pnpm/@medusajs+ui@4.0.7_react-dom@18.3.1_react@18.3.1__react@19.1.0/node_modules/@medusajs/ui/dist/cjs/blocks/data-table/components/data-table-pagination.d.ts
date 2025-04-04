import * as React from "react";
import { Table } from "../../../components/table";
interface DataTablePaginationProps {
    /**
     * The translations for strings in the pagination component.
     */
    translations?: React.ComponentProps<typeof Table.Pagination>["translations"];
}
/**
 * This component adds a pagination component and functionality to the data table.
 */
declare const DataTablePagination: {
    (props: DataTablePaginationProps): React.JSX.Element;
    displayName: string;
};
export { DataTablePagination };
export type { DataTablePaginationProps };
//# sourceMappingURL=data-table-pagination.d.ts.map