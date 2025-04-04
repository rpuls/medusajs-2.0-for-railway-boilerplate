import * as React from "react";
interface DataTableSearchProps {
    /**
     * If true, the search input will be focused on mount.
     */
    autoFocus?: boolean;
    /**
     * Additional classes to pass to the search input.
     */
    className?: string;
    /**
     * The placeholder text to show in the search input.
     */
    placeholder?: string;
}
/**
 * This component adds a search input to the data table, allowing users
 * to search through the table's data.
 */
declare const DataTableSearch: {
    (props: DataTableSearchProps): React.JSX.Element;
    displayName: string;
};
export { DataTableSearch };
export type { DataTableSearchProps };
//# sourceMappingURL=data-table-search.d.ts.map