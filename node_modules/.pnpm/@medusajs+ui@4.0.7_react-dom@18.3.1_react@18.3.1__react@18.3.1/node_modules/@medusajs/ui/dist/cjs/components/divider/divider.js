"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Divider = void 0;
const tslib_1 = require("tslib");
const clx_1 = require("../../utils/clx");
const React = tslib_1.__importStar(require("react"));
const Divider = ({ orientation = "horizontal", variant = "solid", className, ...props }) => {
    return (React.createElement("div", { "aria-orientation": orientation, role: "separator", className: (0, clx_1.clx)("border-ui-border-base", {
            "w-full border-t": orientation === "horizontal" && variant === "solid",
            "h-full border-l": orientation === "vertical" && variant === "solid",
            "bg-transparent": variant === "dashed",
            "h-px w-full bg-[linear-gradient(90deg,var(--border-strong)_1px,transparent_1px)] bg-[length:4px_1px]": variant === "dashed" && orientation === "horizontal",
            "h-full w-px bg-[linear-gradient(0deg,var(--border-strong)_1px,transparent_1px)] bg-[length:1px_4px]": variant === "dashed" && orientation === "vertical",
        }, className), ...props }));
};
exports.Divider = Divider;
//# sourceMappingURL=divider.js.map