"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataTableCommandBar = void 0;
const tslib_1 = require("tslib");
const React = tslib_1.__importStar(require("react"));
const use_data_table_context_1 = require("../../data-table/context/use-data-table-context");
const command_bar_1 = require("../../../components/command-bar");
/**
 * This component adds a command bar to the data table, which is used
 * to show commands that can be executed on the selected rows.
 */
const DataTableCommandBar = (props) => {
    const { instance } = (0, use_data_table_context_1.useDataTableContext)();
    const commands = instance.getCommands();
    const rowSelection = instance.getRowSelection();
    const count = Object.keys(rowSelection || []).length;
    const open = commands && commands.length > 0 && count > 0;
    function getSelectedLabel(count) {
        if (typeof props.selectedLabel === "function") {
            return props.selectedLabel(count);
        }
        return props.selectedLabel;
    }
    if (!commands || commands.length === 0) {
        return null;
    }
    return (React.createElement(command_bar_1.CommandBar, { open: open },
        React.createElement(command_bar_1.CommandBar.Bar, null,
            props.selectedLabel && (React.createElement(React.Fragment, null,
                React.createElement(command_bar_1.CommandBar.Value, null, getSelectedLabel(count)),
                React.createElement(command_bar_1.CommandBar.Seperator, null))),
            commands.map((command, idx) => (React.createElement(React.Fragment, { key: idx },
                React.createElement(command_bar_1.CommandBar.Command, { key: command.label, action: () => command.action(rowSelection), label: command.label, shortcut: command.shortcut }),
                idx < commands.length - 1 && React.createElement(command_bar_1.CommandBar.Seperator, null)))))));
};
exports.DataTableCommandBar = DataTableCommandBar;
DataTableCommandBar.displayName = "DataTable.CommandBar";
//# sourceMappingURL=data-table-command-bar.js.map