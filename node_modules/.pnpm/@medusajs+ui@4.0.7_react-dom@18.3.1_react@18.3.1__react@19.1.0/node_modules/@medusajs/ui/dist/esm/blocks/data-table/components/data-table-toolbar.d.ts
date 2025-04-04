import * as React from "react";
interface DataTableToolbarTranslations {
    /**
     * The label for the clear all filters button
     * @default "Clear all"
     */
    clearAll?: string;
}
interface DataTableToolbarProps {
    /**
     * Additional classes to pass to the wrapper `div` of the component.
     */
    className?: string;
    /**
     * The children to show in the toolbar.
     */
    children?: React.ReactNode;
    /**
     * The translations of strings in the toolbar.
     */
    translations?: DataTableToolbarTranslations;
}
/**
 * Toolbar shown for the data table.
 */
declare const DataTableToolbar: (props: DataTableToolbarProps) => React.JSX.Element;
export { DataTableToolbar };
export type { DataTableToolbarProps, DataTableToolbarTranslations };
//# sourceMappingURL=data-table-toolbar.d.ts.map