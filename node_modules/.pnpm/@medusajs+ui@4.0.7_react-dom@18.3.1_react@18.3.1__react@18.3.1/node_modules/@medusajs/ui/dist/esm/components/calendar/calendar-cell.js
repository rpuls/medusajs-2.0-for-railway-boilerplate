"use client";
import * as React from "react";
import { useCalendarCell } from "react-aria";
import { clx } from "../../utils/clx";
const CalendarCell = ({ state, date }) => {
    const ref = React.useRef(null);
    const { cellProps, buttonProps, isSelected, isOutsideVisibleRange, isDisabled, isUnavailable, formattedDate, } = useCalendarCell({ date }, state, ref);
    const isToday = getIsToday(date);
    return (React.createElement("td", { ...cellProps, className: "p-1" },
        React.createElement("div", { ...buttonProps, ref: ref, hidden: isOutsideVisibleRange, className: clx("bg-ui-bg-base txt-compact-small relative flex size-8 items-center justify-center rounded-md outline-none transition-fg border border-transparent", "hover:bg-ui-bg-base-hover", "focus-visible:shadow-borders-focus focus-visible:border-ui-border-interactive", {
                "!bg-ui-bg-interactive !text-ui-fg-on-color": isSelected,
                "hidden": isOutsideVisibleRange,
                "text-ui-fg-muted hover:!bg-ui-bg-base cursor-default": isDisabled || isUnavailable,
            }) },
            formattedDate,
            isToday && (React.createElement("div", { role: "none", className: clx("bg-ui-bg-interactive absolute bottom-[3px] left-1/2 size-[3px] -translate-x-1/2 rounded-full transition-fg", {
                    "bg-ui-fg-on-color": isSelected,
                }) })))));
};
/**
 * Check if the date is today. The CalendarDate is using a 1-based index for the month.
 * @returns Whether the CalendarDate is today.
 */
function getIsToday(date) {
    const today = new Date();
    return ([date.year, date.month, date.day].join("-") ===
        [today.getFullYear(), today.getMonth() + 1, today.getDate()].join("-"));
}
export { CalendarCell };
//# sourceMappingURL=calendar-cell.js.map