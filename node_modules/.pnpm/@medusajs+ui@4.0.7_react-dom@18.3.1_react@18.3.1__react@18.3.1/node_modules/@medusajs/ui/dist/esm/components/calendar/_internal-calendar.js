"use client";
import { createCalendar } from "@internationalized/date";
import { TriangleLeftMini, TriangleRightMini } from "@medusajs/icons";
import * as React from "react";
import { useCalendar, useLocale, } from "react-aria";
import { useCalendarState } from "react-stately";
import { CalendarButton } from "./calendar-button";
import { CalendarGrid } from "./calendar-grid";
/**
 * InternalCalendar is the internal implementation of the Calendar component.
 * It's not for public use, but only used for other components like DatePicker.
 */
const InternalCalendar = (props) => {
    const { locale } = useLocale();
    const state = useCalendarState({
        ...props,
        locale,
        createCalendar,
    });
    const { calendarProps, prevButtonProps, nextButtonProps, title } = useCalendar(props, state);
    return (React.createElement("div", { ...calendarProps, className: "flex flex-col gap-y-2" },
        React.createElement("div", { className: "bg-ui-bg-field border-base grid grid-cols-[28px_1fr_28px] items-center gap-1 rounded-md border p-0.5" },
            React.createElement(CalendarButton, { ...prevButtonProps },
                React.createElement(TriangleLeftMini, null)),
            React.createElement("div", { className: "flex items-center justify-center" },
                React.createElement("h2", { className: "txt-compact-small-plus" }, title)),
            React.createElement(CalendarButton, { ...nextButtonProps },
                React.createElement(TriangleRightMini, null))),
        React.createElement(CalendarGrid, { state: state })));
};
export { InternalCalendar };
//# sourceMappingURL=_internal-calendar.js.map