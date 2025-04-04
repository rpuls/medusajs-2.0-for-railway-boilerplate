import { DeepKeys } from "@tanstack/react-table";
import { DataTableFilter, DataTableFilterProps } from "../types";
declare const createDataTableFilterHelper: <TData>() => {
    accessor: (accessor: DeepKeys<TData>, props: DataTableFilterProps) => {
        type: "radio";
        options: import("../types").DataTableFilterOption<string>[];
        label: string;
        id: DeepKeys<TData>;
    } | {
        type: "select";
        options: import("../types").DataTableFilterOption<string>[];
        label: string;
        id: DeepKeys<TData>;
    } | {
        type: "date";
        format?: "date" | "date-time" | undefined;
        rangeOptionLabel?: string | undefined;
        rangeOptionStartLabel?: string | undefined;
        rangeOptionEndLabel?: string | undefined;
        disableRangeOption?: boolean | undefined;
        formatDateValue?: ((value: Date) => string) | undefined;
        options: import("../types").DataTableFilterOption<import("../types").DataTableDateComparisonOperator>[];
        label: string;
        id: DeepKeys<TData>;
    };
    custom: <T extends DataTableFilterProps>(props: DataTableFilter<T>) => DataTableFilter<T>;
};
export { createDataTableFilterHelper };
//# sourceMappingURL=create-data-table-filter-helper.d.ts.map