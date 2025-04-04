import * as React from "react";
interface DataTableCommandBarProps {
    /**
     * The label to show when items are selected. If a function is passed,
     * it will be called with the count of selected items.
     */
    selectedLabel?: ((count: number) => string) | string;
}
/**
 * This component adds a command bar to the data table, which is used
 * to show commands that can be executed on the selected rows.
 */
declare const DataTableCommandBar: {
    (props: DataTableCommandBarProps): React.JSX.Element | null;
    displayName: string;
};
export { DataTableCommandBar };
export type { DataTableCommandBarProps };
//# sourceMappingURL=data-table-command-bar.d.ts.map