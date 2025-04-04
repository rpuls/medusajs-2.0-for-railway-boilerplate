"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatePickerField = void 0;
const tslib_1 = require("tslib");
const date_1 = require("@internationalized/date");
const React = tslib_1.__importStar(require("react"));
const react_aria_1 = require("react-aria");
const react_stately_1 = require("react-stately");
const date_segment_1 = require("../date-segment");
const cva_1 = require("cva");
const datePickerFieldStyles = (0, cva_1.cva)({
    base: "flex items-center tabular-nums",
    variants: {
        size: {
            small: "py-1",
            base: "py-1.5",
        },
    },
    defaultVariants: {
        size: "base",
    },
});
const DatePickerField = ({ size = "base", ...props }) => {
    const { locale } = (0, react_aria_1.useLocale)();
    const state = (0, react_stately_1.useDateFieldState)({
        ...props,
        locale,
        createCalendar: date_1.createCalendar,
    });
    const ref = React.useRef(null);
    const { fieldProps } = (0, react_aria_1.useDateField)(props, state, ref);
    return (React.createElement("div", { ref: ref, "aria-label": "Date input", className: datePickerFieldStyles({ size }), ...fieldProps }, state.segments.map((segment, index) => {
        return React.createElement(date_segment_1.DateSegment, { key: index, segment: segment, state: state });
    })));
};
exports.DatePickerField = DatePickerField;
//# sourceMappingURL=date-picker-field.js.map