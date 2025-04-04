"use client";
import * as React from "react";
import { useDataTableContext } from "../../data-table/context/use-data-table-context";
import { CommandBar } from "../../../components/command-bar";
/**
 * This component adds a command bar to the data table, which is used
 * to show commands that can be executed on the selected rows.
 */
const DataTableCommandBar = (props) => {
    const { instance } = useDataTableContext();
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
    return (React.createElement(CommandBar, { open: open },
        React.createElement(CommandBar.Bar, null,
            props.selectedLabel && (React.createElement(React.Fragment, null,
                React.createElement(CommandBar.Value, null, getSelectedLabel(count)),
                React.createElement(CommandBar.Seperator, null))),
            commands.map((command, idx) => (React.createElement(React.Fragment, { key: idx },
                React.createElement(CommandBar.Command, { key: command.label, action: () => command.action(rowSelection), label: command.label, shortcut: command.shortcut }),
                idx < commands.length - 1 && React.createElement(CommandBar.Seperator, null)))))));
};
DataTableCommandBar.displayName = "DataTable.CommandBar";
export { DataTableCommandBar };
//# sourceMappingURL=data-table-command-bar.js.map