"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InlineTip = void 0;
const tslib_1 = require("tslib");
const clx_1 = require("../../utils/clx");
const React = tslib_1.__importStar(require("react"));
/**
 * This component is based on the `div` element and supports all of its props.
 */
exports.InlineTip = React.forwardRef(({ 
/**
 * The variant of the tip.
 */
variant = "info", 
/**
 * The label to display in the tip.
 */
label, className, children, ...props }, ref) => {
    return (React.createElement("div", { ref: ref, className: (0, clx_1.clx)("bg-ui-bg-component txt-small text-ui-fg-subtle grid grid-cols-[4px_1fr] items-start gap-3 rounded-lg border p-3", className), ...props },
        React.createElement("div", { role: "presentation", className: (0, clx_1.clx)("bg-ui-tag-neutral-icon h-full w-1 rounded-full", {
                "bg-ui-tag-orange-icon": variant === "warning",
                "bg-ui-tag-red-icon": variant === "error",
                "bg-ui-tag-green-icon": variant === "success",
            }) }),
        React.createElement("div", { className: "text-pretty" },
            React.createElement("strong", { className: "txt-small-plus text-ui-fg-base" },
                label,
                ":"),
            " ",
            children)));
});
exports.InlineTip.displayName = "InlineTip";
//# sourceMappingURL=inline-tip.js.map