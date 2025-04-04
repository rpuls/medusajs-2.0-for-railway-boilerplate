import { getWeeksInMonth } from "@internationalized/date";
import * as React from "react";
import { useCalendarGrid, useLocale } from "react-aria";
import { CalendarCell } from "./calendar-cell";
const CalendarGrid = ({ state, ...props }) => {
    const { locale } = useLocale();
    const { gridProps, headerProps, weekDays } = useCalendarGrid(props, state);
    const weeksInMonth = getWeeksInMonth(state.visibleRange.start, locale);
    return (React.createElement("table", { ...gridProps },
        React.createElement("thead", { ...headerProps },
            React.createElement("tr", null, weekDays.map((day, index) => (React.createElement("th", { key: index, className: "txt-compact-small-plus text-ui-fg-muted size-8 p-1 rounded-md" }, day))))),
        React.createElement("tbody", null, [...new Array(weeksInMonth).keys()].map((weekIndex) => (React.createElement("tr", { key: weekIndex }, state
            .getDatesInWeek(weekIndex)
            .map((date, i) => date ? (React.createElement(CalendarCell, { key: i, state: state, date: date })) : (React.createElement("td", { key: i })))))))));
};
export { CalendarGrid };
//# sourceMappingURL=calendar-grid.js.map