"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDataTableColumnHelper = void 0;
const tslib_1 = require("tslib");
const react_table_1 = require("@tanstack/react-table");
const React = tslib_1.__importStar(require("react"));
const data_table_action_cell_1 = require("../components/data-table-action-cell");
const data_table_select_cell_1 = require("../components/data-table-select-cell");
const createDataTableColumnHelper = () => {
    const { accessor: accessorTanstack, display } = (0, react_table_1.createColumnHelper)();
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
            cell: (ctx) => React.createElement(data_table_action_cell_1.DataTableActionCell, { ctx: ctx }),
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
                : (ctx) => React.createElement(data_table_select_cell_1.DataTableSelectHeader, { ctx: ctx }),
            cell: (props === null || props === void 0 ? void 0 : props.cell)
                ? props.cell
                : (ctx) => React.createElement(data_table_select_cell_1.DataTableSelectCell, { ctx: ctx }),
        }),
    };
};
exports.createDataTableColumnHelper = createDataTableColumnHelper;
const helper = (0, react_table_1.createColumnHelper)();
helper.accessor("name", {
    meta: {},
});
//# sourceMappingURL=create-data-table-column-helper.js.map