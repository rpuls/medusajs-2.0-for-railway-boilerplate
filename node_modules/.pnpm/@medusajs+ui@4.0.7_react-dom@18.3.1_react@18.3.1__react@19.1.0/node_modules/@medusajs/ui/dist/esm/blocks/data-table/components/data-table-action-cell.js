"use client";
import * as React from "react";
import { DropdownMenu } from "../../../components/dropdown-menu";
import { IconButton } from "../../../components/icon-button";
import { EllipsisHorizontal } from "@medusajs/icons";
const DataTableActionCell = ({ ctx, }) => {
    const meta = ctx.column.columnDef.meta;
    const actions = meta === null || meta === void 0 ? void 0 : meta.___actions;
    if (!actions) {
        return null;
    }
    const resolvedActions = typeof actions === "function" ? actions(ctx) : actions;
    if (!Array.isArray(resolvedActions)) {
        return null;
    }
    return (React.createElement(DropdownMenu, null,
        React.createElement(DropdownMenu.Trigger, { asChild: true, className: "ml-1" },
            React.createElement(IconButton, { size: "small", variant: "transparent" },
                React.createElement(EllipsisHorizontal, null))),
        React.createElement(DropdownMenu.Content, { side: "bottom" }, resolvedActions.map((actionOrGroup, idx) => {
            const isArray = Array.isArray(actionOrGroup);
            const isLast = idx === resolvedActions.length - 1;
            return isArray ? (React.createElement(React.Fragment, { key: idx },
                actionOrGroup.map((action) => (React.createElement(DropdownMenu.Item, { key: action.label, onClick: (e) => {
                        e.stopPropagation();
                        action.onClick(ctx);
                    }, className: "[&>svg]:text-ui-fg-subtle flex items-center gap-2" },
                    action.icon,
                    action.label))),
                !isLast && React.createElement(DropdownMenu.Separator, null))) : (React.createElement(DropdownMenu.Item, { key: actionOrGroup.label, onClick: (e) => {
                    e.stopPropagation();
                    actionOrGroup.onClick(ctx);
                }, className: "[&>svg]:text-ui-fg-subtle flex items-center gap-2" },
                actionOrGroup.icon,
                actionOrGroup.label));
        }))));
};
DataTableActionCell.displayName = "DataTable.ActionCell";
export { DataTableActionCell };
//# sourceMappingURL=data-table-action-cell.js.map