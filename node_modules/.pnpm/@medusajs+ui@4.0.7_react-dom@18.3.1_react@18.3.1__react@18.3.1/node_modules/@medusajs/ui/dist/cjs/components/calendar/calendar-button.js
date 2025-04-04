"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarButton = void 0;
const tslib_1 = require("tslib");
const React = tslib_1.__importStar(require("react"));
const react_aria_1 = require("react-aria");
const icon_button_1 = require("../icon-button");
const CalendarButton = React.forwardRef(({ children, ...props }, ref) => {
    const innerRef = React.useRef(null);
    React.useImperativeHandle(ref, () => innerRef.current);
    const { buttonProps } = (0, react_aria_1.useButton)(props, innerRef);
    return (React.createElement(icon_button_1.IconButton, { size: "small", variant: "transparent", className: "rounded-[4px]", ...buttonProps }, children));
});
exports.CalendarButton = CalendarButton;
CalendarButton.displayName = "CalendarButton";
//# sourceMappingURL=calendar-button.js.map