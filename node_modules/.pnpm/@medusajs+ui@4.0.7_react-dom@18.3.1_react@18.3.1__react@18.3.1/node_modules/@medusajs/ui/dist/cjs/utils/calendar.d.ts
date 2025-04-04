import { CalendarDate, CalendarDateTime } from "@internationalized/date";
import { Granularity } from "../types";
declare function getDefaultCalendarDate(value: Date | null | undefined, defaultValue: Date | null | undefined): CalendarDate | null;
declare function createCalendarDate(date: Date): CalendarDate;
declare function updateCalendarDate(date: CalendarDate | null | undefined, value: Date): CalendarDate;
declare function createCalendarDateFromDate(date: Date, granularity?: Granularity): CalendarDate | CalendarDateTime;
declare function updateCalendarDateFromDate(date: CalendarDate | CalendarDateTime | null | undefined, value: Date, granularity?: Granularity): CalendarDate | CalendarDateTime;
declare function getDefaultCalendarDateFromDate(value: Date | null | undefined, defaultValue: Date | null | undefined, granularity?: Granularity): CalendarDate | CalendarDateTime | null;
export { createCalendarDate, createCalendarDateFromDate, getDefaultCalendarDate, getDefaultCalendarDateFromDate, updateCalendarDate, updateCalendarDateFromDate, };
//# sourceMappingURL=calendar.d.ts.map