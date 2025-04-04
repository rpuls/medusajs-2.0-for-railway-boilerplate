"use client";
import { createColumnHelper as createColumnHelperTanstack } from "@tanstack/react-table";
import * as React from "react";
import { DataTableActionCell } from "../components/data-table-action-cell";
import { DataTableSelectCell, DataTableSelectHeader, } from "../components/data-table-select-cell";
const createDataTableColumnHelper = () => {
    const { accessor: accessorTanstack, display } = createColumnHelperTanstack();
    return {
        accessor: (accessor, column) => {
            const { sortLabel, sortAscLabel, sortDescLabel, meta, enableSorting, ...rest } = column;
            const extendedMeta = {
                ___sortMetaData: { sortLabel, sortAscLabel, sortDescLabel },
                ...(meta || {}),
            };
            return accessorTanstack(accessor, {
                ...rest,
                enableSorting: enableSorting !== null && enableSorting !== void 0 ? enableSorting : false,
                meta: extendedMeta,
            });
        },
        display,
        action: ({ actions, ...props }) => display({
            id: "action",
            cell: (ctx) => React.createElement(DataTableActionCell, { ctx: ctx }),
            meta: {
                ___actions: actions,
                ...(props.meta || {}),
            },
            ...props,
        }),
        select: (props) => display({
            id: "select",
            header: (props === null || props === void 0 ? void 0 : props.header)
                ? props.header
                : (ctx) => React.createElement(DataTableSelectHeader, { ctx: ctx }),
            cell: (props === null || props === void 0 ? void 0 : props.cell)
                ? props.cell
                : (ctx) => React.createElement(DataTableSelectCell, { ctx: ctx }),
        }),
    };
};
const helper = createColumnHelperTanstack();
helper.accessor("name", {
    meta: {},
});
export { createDataTableColumnHelper };
//# sourceMappingURL=create-data-table-column-helper.js.map