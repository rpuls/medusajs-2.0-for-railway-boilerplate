"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalCalendar = void 0;
const tslib_1 = require("tslib");
const date_1 = require("@internationalized/date");
const icons_1 = require("@medusajs/icons");
const React = tslib_1.__importStar(require("react"));
const react_aria_1 = require("react-aria");
const react_stately_1 = require("react-stately");
const calendar_button_1 = require("./calendar-button");
const calendar_grid_1 = require("./calendar-grid");
/**
 * InternalCalendar is the internal implementation of the Calendar component.
 * It's not for public use, but only used for other components like DatePicker.
 */
const InternalCalendar = (props) => {
    const { locale } = (0, react_aria_1.useLocale)();
    const state = (0, react_stately_1.useCalendarState)({
        ...props,
        locale,
        createCalendar: date_1.createCalendar,
    });
    const { calendarProps, prevButtonProps, nextButtonProps, title } = (0, react_aria_1.useCalendar)(props, state);
    return (React.createElement("div", { ...calendarProps, className: "flex flex-col gap-y-2" },
        React.createElement("div", { className: "bg-ui-bg-field border-base grid grid-cols-[28px_1fr_28px] items-center gap-1 rounded-md border p-0.5" },
            React.createElement(calendar_button_1.CalendarButton, { ...prevButtonProps },
                React.createElement(icons_1.TriangleLeftMini, null)),
            React.createElement("div", { className: "flex items-center justify-center" },
                React.createElement("h2", { className: "txt-compact-small-plus" }, title)),
            React.createElement(calendar_button_1.CalendarButton, { ...nextButtonProps },
                React.createElement(icons_1.TriangleRightMini, null))),
        React.createElement(calendar_grid_1.CalendarGrid, { state: state })));
};
exports.InternalCalendar = InternalCalendar;
//# sourceMappingURL=_internal-calendar.js.map