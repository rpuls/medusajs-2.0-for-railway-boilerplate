import { CalendarDate } from "@internationalized/date";
import * as React from "react";
import { type CalendarProps as BaseCalendarProps } from "react-aria";
interface CalendarValueProps {
    value?: Date | null;
    defaultValue?: Date | null;
    onChange?: (value: Date | null) => void;
    isDateUnavailable?: (date: Date) => boolean;
    minValue?: Date;
    maxValue?: Date;
}
interface CalendarProps extends Omit<BaseCalendarProps<CalendarDate>, keyof CalendarValueProps>, CalendarValueProps {
}
/**
 * Calendar component used to select a date.
 * Its props are based on [React Aria Calendar](https://react-spectrum.adobe.com/react-aria/Calendar.html#calendar-1).
 */
declare const Calendar: (props: CalendarProps) => React.JSX.Element;
export { Calendar };
//# sourceMappingURL=calendar.d.ts.map