"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatePickerButton = void 0;
const tslib_1 = require("tslib");
const clx_1 = require("../../utils/clx");
const React = tslib_1.__importStar(require("react"));
const react_aria_1 = require("react-aria");
const DatePickerButton = React.forwardRef(({ children, size = "base", ...props }, ref) => {
    const innerRef = React.useRef(null);
    React.useImperativeHandle(ref, () => innerRef.current);
    const { buttonProps } = (0, react_aria_1.useButton)(props, innerRef);
    return (React.createElement("button", { type: "button", className: (0, clx_1.clx)("text-ui-fg-muted transition-fg flex items-center justify-center border-r outline-none", "disabled:text-ui-fg-disabled", "hover:bg-ui-button-transparent-hover", "focus-visible:bg-ui-bg-interactive focus-visible:text-ui-fg-on-color", {
            "size-7": size === "small",
            "size-8": size === "base",
        }), "aria-label": "Open calendar", ...buttonProps }, children));
});
exports.DatePickerButton = DatePickerButton;
DatePickerButton.displayName = "DatePickerButton";
//# sourceMappingURL=date-picker-button.js.map