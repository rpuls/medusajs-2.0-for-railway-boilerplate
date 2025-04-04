import { CalendarDate } from "@internationalized/date";
import * as React from "react";
import { CalendarState } from "react-stately";
interface CalendarCellProps {
    date: CalendarDate;
    state: CalendarState;
}
declare const CalendarCell: ({ state, date }: CalendarCellProps) => React.JSX.Element;
export { CalendarCell };
//# sourceMappingURL=calendar-cell.d.ts.map