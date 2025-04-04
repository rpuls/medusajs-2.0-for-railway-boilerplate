"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Command = void 0;
const tslib_1 = require("tslib");
const copy_1 = require("../copy");
const clx_1 = require("../../utils/clx");
const react_1 = tslib_1.__importDefault(require("react"));
/**
 * This component is based on the div element and supports all of its props
 */
const CommandComponent = ({ className, ...props }) => {
    return (react_1.default.createElement("div", { className: (0, clx_1.clx)("bg-ui-contrast-bg-base shadow-elevation-code-block flex items-center rounded-lg px-4 py-1.5", "[&>code]:text-ui-contrast-fg-primary [&>code]:code-body [&>code]:mx-2", className), ...props }));
};
CommandComponent.displayName = "Command";
const CommandCopy = react_1.default.forwardRef(({ className, ...props }, ref) => {
    return (react_1.default.createElement(copy_1.Copy, { ...props, ref: ref, className: (0, clx_1.clx)("!text-ui-contrast-fg-secondary ml-auto", className) }));
});
CommandCopy.displayName = "Command.Copy";
const Command = Object.assign(CommandComponent, { Copy: CommandCopy });
exports.Command = Command;
//# sourceMappingURL=command.js.map