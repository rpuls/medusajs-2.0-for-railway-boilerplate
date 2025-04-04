import { DatePickerProps, DateValue, Granularity, TimeValue, DateRange, DateRangePickerProps, TimePickerProps } from "@react-types/datepicker";
import { DateFormatter, Calendar, Time } from "@internationalized/date";
import { FormValidationState } from "@react-stately/form";
import { OverlayTriggerState } from "@react-stately/overlays";
import { ValidationState, RangeValue } from "@react-types/shared";
type FieldOptions = Pick<Intl.DateTimeFormatOptions, 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'>;
interface FormatterOptions {
    timeZone?: string;
    hideTimeZone?: boolean;
    granularity?: DatePickerProps<any>['granularity'];
    maxGranularity?: 'year' | 'month' | DatePickerProps<any>['granularity'];
    hourCycle?: 12 | 24;
    showEra?: boolean;
    shouldForceLeadingZeros?: boolean;
}
export interface DatePickerStateOptions<T extends DateValue> extends DatePickerProps<T> {
    /**
     * Determines whether the date picker popover should close automatically when a date is selected.
     * @default true
     */
    shouldCloseOnSelect?: boolean | (() => boolean);
}
export interface DatePickerState extends OverlayTriggerState, FormValidationState {
    /** The currently selected date. */
    value: DateValue | null;
    /** Sets the selected date. */
    setValue(value: DateValue | null): void;
    /**
     * The date portion of the value. This may be set prior to `value` if the user has
     * selected a date but has not yet selected a time.
     */
    dateValue: DateValue | null;
    /** Sets the date portion of the value. */
    setDateValue(value: DateValue): void;
    /**
     * The time portion of the value. This may be set prior to `value` if the user has
     * selected a time but has not yet selected a date.
     */
    timeValue: TimeValue | null;
    /** Sets the time portion of the value. */
    setTimeValue(value: TimeValue): void;
    /** The granularity for the field, based on the `granularity` prop and current value. */
    granularity: Granularity;
    /** Whether the date picker supports selecting a time, according to the `granularity` prop and current value. */
    hasTime: boolean;
    /** Whether the calendar popover is currently open. */
    isOpen: boolean;
    /** Sets whether the calendar popover is open. */
    setOpen(isOpen: boolean): void;
    /**
     * The current validation state of the date picker, based on the `validationState`, `minValue`, and `maxValue` props.
     * @deprecated Use `isInvalid` instead.
     */
    validationState: ValidationState | null;
    /** Whether the date picker is invalid, based on the `isInvalid`, `minValue`, and `maxValue` props. */
    isInvalid: boolean;
    /** Formats the selected value using the given options. */
    formatValue(locale: string, fieldOptions: FieldOptions): string;
    /** Gets a formatter based on state's props. */
    getDateFormatter(locale: string, formatOptions: FormatterOptions): DateFormatter;
}
/**
 * Provides state management for a date picker component.
 * A date picker combines a DateField and a Calendar popover to allow users to enter or select a date and time value.
 */
export function useDatePickerState<T extends DateValue = DateValue>(props: DatePickerStateOptions<T>): DatePickerState;
export type SegmentType = 'era' | 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second' | 'dayPeriod' | 'literal' | 'timeZoneName';
export interface DateSegment {
    /** The type of segment. */
    type: SegmentType;
    /** The formatted text for the segment. */
    text: string;
    /** The numeric value for the segment, if applicable. */
    value?: number;
    /** The minimum numeric value for the segment, if applicable. */
    minValue?: number;
    /** The maximum numeric value for the segment, if applicable. */
    maxValue?: number;
    /** Whether the value is a placeholder. */
    isPlaceholder: boolean;
    /** A placeholder string for the segment. */
    placeholder: string;
    /** Whether the segment is editable. */
    isEditable: boolean;
}
export interface DateFieldState extends FormValidationState {
    /** The current field value. */
    value: DateValue | null;
    /** The current value, converted to a native JavaScript `Date` object.  */
    dateValue: Date;
    /** The calendar system currently in use. */
    calendar: Calendar;
    /** Sets the field's value. */
    setValue(value: DateValue | null): void;
    /** A list of segments for the current value. */
    segments: DateSegment[];
    /** A date formatter configured for the current locale and format. */
    dateFormatter: DateFormatter;
    /**
     * The current validation state of the date field, based on the `validationState`, `minValue`, and `maxValue` props.
     * @deprecated Use `isInvalid` instead.
     */
    validationState: ValidationState | null;
    /** Whether the date field is invalid, based on the `isInvalid`, `minValue`, and `maxValue` props. */
    isInvalid: boolean;
    /** The granularity for the field, based on the `granularity` prop and current value. */
    granularity: Granularity;
    /** The maximum date or time unit that is displayed in the field. */
    maxGranularity: 'year' | 'month' | Granularity;
    /** Whether the field is disabled. */
    isDisabled: boolean;
    /** Whether the field is read only. */
    isReadOnly: boolean;
    /** Whether the field is required. */
    isRequired: boolean;
    /** Increments the given segment. Upon reaching the minimum or maximum value, the value wraps around to the opposite limit. */
    increment(type: SegmentType): void;
    /** Decrements the given segment. Upon reaching the minimum or maximum value, the value wraps around to the opposite limit. */
    decrement(type: SegmentType): void;
    /**
     * Increments the given segment by a larger amount, rounding it to the nearest increment.
     * The amount to increment by depends on the field, for example 15 minutes, 7 days, and 5 years.
     * Upon reaching the minimum or maximum value, the value wraps around to the opposite limit.
     */
    incrementPage(type: SegmentType): void;
    /**
     * Decrements the given segment by a larger amount, rounding it to the nearest increment.
     * The amount to decrement by depends on the field, for example 15 minutes, 7 days, and 5 years.
     * Upon reaching the minimum or maximum value, the value wraps around to the opposite limit.
     */
    decrementPage(type: SegmentType): void;
    /** Sets the value of the given segment. */
    setSegment(type: 'era', value: string): void;
    setSegment(type: SegmentType, value: number): void;
    /** Updates the remaining unfilled segments with the placeholder value. */
    confirmPlaceholder(): void;
    /** Clears the value of the given segment, reverting it to the placeholder. */
    clearSegment(type: SegmentType): void;
    /** Formats the current date value using the given options. */
    formatValue(fieldOptions: FieldOptions): string;
    /** Gets a formatter based on state's props. */
    getDateFormatter(locale: string, formatOptions: FormatterOptions): DateFormatter;
}
export interface DateFieldStateOptions<T extends DateValue = DateValue> extends DatePickerProps<T> {
    /**
     * The maximum unit to display in the date field.
     * @default 'year'
     */
    maxGranularity?: 'year' | 'month' | Granularity;
    /** The locale to display and edit the value according to. */
    locale: string;
    /**
     * A function that creates a [Calendar](../internationalized/date/Calendar.html)
     * object for a given calendar identifier. Such a function may be imported from the
     * `@internationalized/date` package, or manually implemented to include support for
     * only certain calendars.
     */
    createCalendar: (name: string) => Calendar;
}
/**
 * Provides state management for a date field component.
 * A date field allows users to enter and edit date and time values using a keyboard.
 * Each part of a date value is displayed in an individually editable segment.
 */
export function useDateFieldState<T extends DateValue = DateValue>(props: DateFieldStateOptions<T>): DateFieldState;
export interface DateRangePickerStateOptions<T extends DateValue = DateValue> extends DateRangePickerProps<T> {
    /**
     * Determines whether the date picker popover should close automatically when a date is selected.
     * @default true
     */
    shouldCloseOnSelect?: boolean | (() => boolean);
}
type TimeRange = RangeValue<TimeValue>;
export interface DateRangePickerState extends OverlayTriggerState, FormValidationState {
    /** The currently selected date range. */
    value: RangeValue<DateValue | null>;
    /** Sets the selected date range. */
    setValue(value: DateRange | null): void;
    /**
     * The date portion of the selected range. This may be set prior to `value` if the user has
     * selected a date range but has not yet selected a time range.
     */
    dateRange: RangeValue<DateValue | null> | null;
    /** Sets the date portion of the selected range. */
    setDateRange(value: DateRange): void;
    /**
     * The time portion of the selected range. This may be set prior to `value` if the user has
     * selected a time range but has not yet selected a date range.
     */
    timeRange: RangeValue<TimeValue | null> | null;
    /** Sets the time portion of the selected range. */
    setTimeRange(value: TimeRange): void;
    /** Sets the date portion of either the start or end of the selected range. */
    setDate(part: 'start' | 'end', value: DateValue | null): void;
    /** Sets the time portion of either the start or end of the selected range. */
    setTime(part: 'start' | 'end', value: TimeValue | null): void;
    /** Sets the date and time of either the start or end of the selected range. */
    setDateTime(part: 'start' | 'end', value: DateValue | null): void;
    /** The granularity for the field, based on the `granularity` prop and current value. */
    granularity: Granularity;
    /** Whether the date range picker supports selecting times, according to the `granularity` prop and current value. */
    hasTime: boolean;
    /** Whether the calendar popover is currently open. */
    isOpen: boolean;
    /** Sets whether the calendar popover is open. */
    setOpen(isOpen: boolean): void;
    /**
     * The current validation state of the date range picker, based on the `validationState`, `minValue`, and `maxValue` props.
     * @deprecated Use `isInvalid` instead.
     */
    validationState: ValidationState | null;
    /** Whether the date range picker is invalid, based on the `isInvalid`, `minValue`, and `maxValue` props. */
    isInvalid: boolean;
    /** Formats the selected range using the given options. */
    formatValue(locale: string, fieldOptions: FieldOptions): {
        start: string;
        end: string;
    } | null;
    /** Gets a formatter based on state's props. */
    getDateFormatter(locale: string, formatOptions: FormatterOptions): DateFormatter;
}
/**
 * Provides state management for a date range picker component.
 * A date range picker combines two DateFields and a RangeCalendar popover to allow
 * users to enter or select a date and time range.
 */
export function useDateRangePickerState<T extends DateValue = DateValue>(props: DateRangePickerStateOptions<T>): DateRangePickerState;
export interface TimeFieldStateOptions<T extends TimeValue = TimeValue> extends TimePickerProps<T> {
    /** The locale to display and edit the value according to. */
    locale: string;
}
export interface TimeFieldState extends DateFieldState {
    /** The current time value. */
    timeValue: Time;
}
/**
 * Provides state management for a time field component.
 * A time field allows users to enter and edit time values using a keyboard.
 * Each part of a time value is displayed in an individually editable segment.
 */
export function useTimeFieldState<T extends TimeValue = TimeValue>(props: TimeFieldStateOptions<T>): TimeFieldState;

//# sourceMappingURL=types.d.ts.map
