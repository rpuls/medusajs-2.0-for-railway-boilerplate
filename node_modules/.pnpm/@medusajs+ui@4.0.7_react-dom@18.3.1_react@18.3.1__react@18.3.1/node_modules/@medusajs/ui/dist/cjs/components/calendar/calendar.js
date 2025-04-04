"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Calendar = void 0;
const tslib_1 = require("tslib");
const date_1 = require("@internationalized/date");
const icons_1 = require("@medusajs/icons");
const React = tslib_1.__importStar(require("react"));
const react_aria_1 = require("react-aria");
const react_stately_1 = require("react-stately");
const calendar_1 = require("../../utils/calendar");
const calendar_button_1 = require("./calendar-button");
const calendar_grid_1 = require("./calendar-grid");
/**
 * Calendar component used to select a date.
 * Its props are based on [React Aria Calendar](https://react-spectrum.adobe.com/react-aria/Calendar.html#calendar-1).
 */
const Calendar = (props) => {
    const [value, setValue] = React.useState(() => (0, calendar_1.getDefaultCalendarDate)(props.value, props.defaultValue));
    const { locale } = (0, react_aria_1.useLocale)();
    const _props = React.useMemo(() => convertProps(props, setValue), [props]);
    const state = (0, react_stately_1.useCalendarState)({
        ..._props,
        value,
        locale,
        createCalendar: date_1.createCalendar,
    });
    React.useEffect(() => {
        setValue(props.value ? (0, calendar_1.updateCalendarDate)(value, props.value) : null);
    }, [props.value]);
    const { calendarProps, prevButtonProps, nextButtonProps, title } = (0, react_aria_1.useCalendar)({ value, ..._props }, state);
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
exports.Calendar = Calendar;
function convertProps(props, setValue) {
    const { minValue, maxValue, isDateUnavailable: _isDateUnavailable, onChange: _onChange, value: __value__, defaultValue: __defaultValue__, ...rest } = props;
    const onChange = (value) => {
        setValue(value);
        _onChange === null || _onChange === void 0 ? void 0 : _onChange(value ? value.toDate((0, date_1.getLocalTimeZone)()) : null);
    };
    const isDateUnavailable = (date) => {
        const _date = date.toDate((0, date_1.getLocalTimeZone)());
        return _isDateUnavailable ? _isDateUnavailable(_date) : false;
    };
    return {
        ...rest,
        onChange,
        isDateUnavailable,
        minValue: minValue ? (0, calendar_1.createCalendarDate)(minValue) : minValue,
        maxValue: maxValue ? (0, calendar_1.createCalendarDate)(maxValue) : maxValue,
    };
}
//# sourceMappingURL=calendar.js.map