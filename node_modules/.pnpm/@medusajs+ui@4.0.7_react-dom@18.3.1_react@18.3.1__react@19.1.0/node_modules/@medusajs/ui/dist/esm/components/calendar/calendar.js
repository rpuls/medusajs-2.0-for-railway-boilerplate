"use client";
import { createCalendar, getLocalTimeZone } from "@internationalized/date";
import { TriangleLeftMini, TriangleRightMini } from "@medusajs/icons";
import * as React from "react";
import { useCalendar, useLocale, } from "react-aria";
import { useCalendarState } from "react-stately";
import { createCalendarDate, getDefaultCalendarDate, updateCalendarDate } from "../../utils/calendar";
import { CalendarButton } from "./calendar-button";
import { CalendarGrid } from "./calendar-grid";
/**
 * Calendar component used to select a date.
 * Its props are based on [React Aria Calendar](https://react-spectrum.adobe.com/react-aria/Calendar.html#calendar-1).
 */
const Calendar = (props) => {
    const [value, setValue] = React.useState(() => getDefaultCalendarDate(props.value, props.defaultValue));
    const { locale } = useLocale();
    const _props = React.useMemo(() => convertProps(props, setValue), [props]);
    const state = useCalendarState({
        ..._props,
        value,
        locale,
        createCalendar,
    });
    React.useEffect(() => {
        setValue(props.value ? updateCalendarDate(value, props.value) : null);
    }, [props.value]);
    const { calendarProps, prevButtonProps, nextButtonProps, title } = useCalendar({ value, ..._props }, state);
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
function convertProps(props, setValue) {
    const { minValue, maxValue, isDateUnavailable: _isDateUnavailable, onChange: _onChange, value: __value__, defaultValue: __defaultValue__, ...rest } = props;
    const onChange = (value) => {
        setValue(value);
        _onChange === null || _onChange === void 0 ? void 0 : _onChange(value ? value.toDate(getLocalTimeZone()) : null);
    };
    const isDateUnavailable = (date) => {
        const _date = date.toDate(getLocalTimeZone());
        return _isDateUnavailable ? _isDateUnavailable(_date) : false;
    };
    return {
        ...rest,
        onChange,
        isDateUnavailable,
        minValue: minValue ? createCalendarDate(minValue) : minValue,
        maxValue: maxValue ? createCalendarDate(maxValue) : maxValue,
    };
}
export { Calendar };
//# sourceMappingURL=calendar.js.map