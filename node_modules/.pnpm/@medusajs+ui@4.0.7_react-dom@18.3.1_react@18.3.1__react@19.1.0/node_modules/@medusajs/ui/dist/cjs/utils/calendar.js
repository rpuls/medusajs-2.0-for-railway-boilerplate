"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCalendarDateFromDate = exports.updateCalendarDate = exports.getDefaultCalendarDateFromDate = exports.getDefaultCalendarDate = exports.createCalendarDateFromDate = exports.createCalendarDate = void 0;
const date_1 = require("@internationalized/date");
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
    return new date_1.CalendarDateTime(date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
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
exports.getDefaultCalendarDate = getDefaultCalendarDate;
function createCalendarDate(date) {
    return new date_1.CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
}
exports.createCalendarDate = createCalendarDate;
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
exports.updateCalendarDate = updateCalendarDate;
const USES_TIME = new Set(["hour", "minute", "second"]);
function createCalendarDateFromDate(date, granularity) {
    if (granularity && USES_TIME.has(granularity)) {
        return createCalendarDateTime(date);
    }
    return createCalendarDate(date);
}
exports.createCalendarDateFromDate = createCalendarDateFromDate;
function updateCalendarDateFromDate(date, value, granularity) {
    if (granularity && USES_TIME.has(granularity)) {
        return updateCalendarDateTime(date, value);
    }
    return updateCalendarDate(date, value);
}
exports.updateCalendarDateFromDate = updateCalendarDateFromDate;
function getDefaultCalendarDateFromDate(value, defaultValue, granularity) {
    if (value) {
        return createCalendarDateFromDate(value, granularity);
    }
    if (defaultValue) {
        return createCalendarDateFromDate(defaultValue, granularity);
    }
    return null;
}
exports.getDefaultCalendarDateFromDate = getDefaultCalendarDateFromDate;
//# sourceMappingURL=calendar.js.map