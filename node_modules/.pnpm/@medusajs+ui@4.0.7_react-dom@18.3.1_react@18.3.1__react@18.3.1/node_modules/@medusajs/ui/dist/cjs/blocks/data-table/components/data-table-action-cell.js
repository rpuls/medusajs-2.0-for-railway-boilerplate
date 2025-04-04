"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataTableActionCell = void 0;
const tslib_1 = require("tslib");
const React = tslib_1.__importStar(require("react"));
const dropdown_menu_1 = require("../../../components/dropdown-menu");
const icon_button_1 = require("../../../components/icon-button");
const icons_1 = require("@medusajs/icons");
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
    return (React.createElement(dropdown_menu_1.DropdownMenu, null,
        React.createElement(dropdown_menu_1.DropdownMenu.Trigger, { asChild: true, className: "ml-1" },
            React.createElement(icon_button_1.IconButton, { size: "small", variant: "transparent" },
                React.createElement(icons_1.EllipsisHorizontal, null))),
        React.createElement(dropdown_menu_1.DropdownMenu.Content, { side: "bottom" }, resolvedActions.map((actionOrGroup, idx) => {
            const isArray = Array.isArray(actionOrGroup);
            const isLast = idx === resolvedActions.length - 1;
            return isArray ? (React.createElement(React.Fragment, { key: idx },
                actionOrGroup.map((action) => (React.createElement(dropdown_menu_1.DropdownMenu.Item, { key: action.label, onClick: (e) => {
                        e.stopPropagation();
                        action.onClick(ctx);
                    }, className: "[&>svg]:text-ui-fg-subtle flex items-center gap-2" },
                    action.icon,
                    action.label))),
                !isLast && React.createElement(dropdown_menu_1.DropdownMenu.Separator, null))) : (React.createElement(dropdown_menu_1.DropdownMenu.Item, { key: actionOrGroup.label, onClick: (e) => {
                    e.stopPropagation();
                    actionOrGroup.onClick(ctx);
                }, className: "[&>svg]:text-ui-fg-subtle flex items-center gap-2" },
                actionOrGroup.icon,
                actionOrGroup.label));
        }))));
};
exports.DataTableActionCell = DataTableActionCell;
DataTableActionCell.displayName = "DataTable.ActionCell";
//# sourceMappingURL=data-table-action-cell.js.map