"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarGrid = void 0;
const tslib_1 = require("tslib");
const date_1 = require("@internationalized/date");
const React = tslib_1.__importStar(require("react"));
const react_aria_1 = require("react-aria");
const calendar_cell_1 = require("./calendar-cell");
const CalendarGrid = ({ state, ...props }) => {
    const { locale } = (0, react_aria_1.useLocale)();
    const { gridProps, headerProps, weekDays } = (0, react_aria_1.useCalendarGrid)(props, state);
    const weeksInMonth = (0, date_1.getWeeksInMonth)(state.visibleRange.start, locale);
    return (React.createElement("table", { ...gridProps },
        React.createElement("thead", { ...headerProps },
            React.createElement("tr", null, weekDays.map((day, index) => (React.createElement("th", { key: index, className: "txt-compact-small-plus text-ui-fg-muted size-8 p-1 rounded-md" }, day))))),
        React.createElement("tbody", null, [...new Array(weeksInMonth).keys()].map((weekIndex) => (React.createElement("tr", { key: weekIndex }, state
            .getDatesInWeek(weekIndex)
            .map((date, i) => date ? (React.createElement(calendar_cell_1.CalendarCell, { key: i, state: state, date: date })) : (React.createElement("td", { key: i })))))))));
};
exports.CalendarGrid = CalendarGrid;
//# sourceMappingURL=calendar-grid.js.map