import { CalendarDate, CalendarDateTime } from "@internationalized/date";
function getDefaultCalendarDateTime(value, defaultValue) {
    if (value) {
        return createCalendarDateTime(value);
    }
    if (defaultValue) {
        return createCalendarDateTime(defaultValue);
    }
    return null;
}
function createCalendarDateTime(date) {
    return new CalendarDateTime(date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
}
function updateCalendarDateTime(date, value) {
    if (!date) {
        return createCalendarDateTime(value);
    }
    date.set({
        day: value.getDate(),
        month: value.getMonth() + 1,
        year: value.getFullYear(),
        hour: value.getHours(),
        minute: value.getMinutes(),
        second: value.getSeconds(),
        millisecond: value.getMilliseconds(),
    });
    return date;
}
function getDefaultCalendarDate(value, defaultValue) {
    if (value) {
        return createCalendarDate(value);
    }
    if (defaultValue) {
        return createCalendarDate(defaultValue);
    }
    return null;
}
function createCalendarDate(date) {
    return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
}
function updateCalendarDate(date, value) {
    if (!date) {
        return createCalendarDate(value);
    }
    date.set({
        day: value.getDate(),
        month: value.getMonth() + 1,
        year: value.getFullYear(),
    });
    return date;
}
const USES_TIME = new Set(["hour", "minute", "second"]);
function createCalendarDateFromDate(date, granularity) {
    if (granularity && USES_TIME.has(granularity)) {
        return createCalendarDateTime(date);
    }
    return createCalendarDate(date);
}
function updateCalendarDateFromDate(date, value, granularity) {
    if (granularity && USES_TIME.has(granularity)) {
        return updateCalendarDateTime(date, value);
    }
    return updateCalendarDate(date, value);
}
function getDefaultCalendarDateFromDate(value, defaultValue, granularity) {
    if (value) {
        return createCalendarDateFromDate(value, granularity);
    }
    if (defaultValue) {
        return createCalendarDateFromDate(defaultValue, granularity);
    }
    return null;
}
export { createCalendarDate, createCalendarDateFromDate, getDefaultCalendarDate, getDefaultCalendarDateFromDate, updateCalendarDate, updateCalendarDateFromDate, };
//# sourceMappingURL=calendar.js.map