"use client";
import { createCalendar } from "@internationalized/date";
import * as React from "react";
import { useDateField, useLocale, } from "react-aria";
import { useDateFieldState } from "react-stately";
import { DateSegment } from "../date-segment";
import { cva } from "cva";
const datePickerFieldStyles = cva({
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
    const { locale } = useLocale();
    const state = useDateFieldState({
        ...props,
        locale,
        createCalendar,
    });
    const ref = React.useRef(null);
    const { fieldProps } = useDateField(props, state, ref);
    return (React.createElement("div", { ref: ref, "aria-label": "Date input", className: datePickerFieldStyles({ size }), ...fieldProps }, state.segments.map((segment, index) => {
        return React.createElement(DateSegment, { key: index, segment: segment, state: state });
    })));
};
export { DatePickerField };
//# sourceMappingURL=date-picker-field.js.map