import { AriaDateFieldProps, AriaTimeFieldProps, DateValue, TimeValue, AriaDatePickerProps, AriaDateRangePickerProps } from "@react-types/datepicker";
import { DateFieldState, TimeFieldState, DatePickerState, DateSegment, DateRangePickerState } from "@react-stately/datepicker";
import { DOMAttributes, GroupDOMAttributes, RefObject, ValidationResult } from "@react-types/shared";
import React, { InputHTMLAttributes } from "react";
import { AriaButtonProps } from "@react-types/button";
import { AriaDialogProps } from "@react-types/dialog";
import { CalendarProps, RangeCalendarProps } from "@react-types/calendar";
export interface AriaDateFieldOptions<T extends DateValue> extends Omit<AriaDateFieldProps<T>, 'value' | 'defaultValue' | 'onChange' | 'minValue' | 'maxValue' | 'placeholderValue' | 'validate'> {
    /** A ref for the hidden input element for HTML form submission. */
    inputRef?: RefObject<HTMLInputElement | null>;
}
export interface DateFieldAria extends ValidationResult {
    /** Props for the field's visible label element, if any. */
    labelProps: DOMAttributes;
    /** Props for the field grouping element. */
    fieldProps: GroupDOMAttributes;
    /** Props for the hidden input element for HTML form submission. */
    inputProps: InputHTMLAttributes<HTMLInputElement>;
    /** Props for the description element, if any. */
    descriptionProps: DOMAttributes;
    /** Props for the error message element, if any. */
    errorMessageProps: DOMAttributes;
}
/**
 * Provides the behavior and accessibility implementation for a date field component.
 * A date field allows users to enter and edit date and time values using a keyboard.
 * Each part of a date value is displayed in an individually editable segment.
 */
export function useDateField<T extends DateValue>(props: AriaDateFieldOptions<T>, state: DateFieldState, ref: RefObject<Element | null>): DateFieldAria;
interface AriaTimeFieldOptions<T extends TimeValue> extends AriaTimeFieldProps<T> {
    /** A ref for the hidden input element for HTML form submission. */
    inputRef?: RefObject<HTMLInputElement | null>;
}
/**
 * Provides the behavior and accessibility implementation for a time field component.
 * A time field allows users to enter and edit time values using a keyboard.
 * Each part of a time value is displayed in an individually editable segment.
 */
export function useTimeField<T extends TimeValue>(props: AriaTimeFieldOptions<T>, state: TimeFieldState, ref: RefObject<Element | null>): DateFieldAria;
export interface DatePickerAria extends ValidationResult {
    /** Props for the date picker's visible label element, if any. */
    labelProps: DOMAttributes;
    /** Props for the grouping element containing the date field and button. */
    groupProps: GroupDOMAttributes;
    /** Props for the date field. */
    fieldProps: AriaDatePickerProps<DateValue>;
    /** Props for the popover trigger button. */
    buttonProps: AriaButtonProps;
    /** Props for the description element, if any. */
    descriptionProps: DOMAttributes;
    /** Props for the error message element, if any. */
    errorMessageProps: DOMAttributes;
    /** Props for the popover dialog. */
    dialogProps: AriaDialogProps;
    /** Props for the calendar within the popover dialog. */
    calendarProps: CalendarProps<DateValue>;
}
/**
 * Provides the behavior and accessibility implementation for a date picker component.
 * A date picker combines a DateField and a Calendar popover to allow users to enter or select a date and time value.
 */
export function useDatePicker<T extends DateValue>(props: AriaDatePickerProps<T>, state: DatePickerState, ref: RefObject<Element | null>): DatePickerAria;
type Field = Intl.DateTimeFormatPartTypes;
interface DisplayNames {
    of(field: Field): string | undefined;
}
/** @private */
export function useDisplayNames(): DisplayNames;
export interface DateSegmentAria {
    /** Props for the segment element. */
    segmentProps: React.HTMLAttributes<HTMLDivElement>;
}
/**
 * Provides the behavior and accessibility implementation for a segment in a date field.
 * A date segment displays an individual unit of a date and time, and allows users to edit
 * the value by typing or using the arrow keys to increment and decrement.
 */
export function useDateSegment(segment: DateSegment, state: DateFieldState, ref: RefObject<HTMLElement | null>): DateSegmentAria;
export interface DateRangePickerAria extends ValidationResult {
    /** Props for the date range picker's visible label element, if any. */
    labelProps: DOMAttributes;
    /** Props for the grouping element containing the date fields and button. */
    groupProps: GroupDOMAttributes;
    /** Props for the start date field. */
    startFieldProps: AriaDatePickerProps<DateValue>;
    /** Props for the end date field. */
    endFieldProps: AriaDatePickerProps<DateValue>;
    /** Props for the popover trigger button. */
    buttonProps: AriaButtonProps;
    /** Props for the description element, if any. */
    descriptionProps: DOMAttributes;
    /** Props for the error message element, if any. */
    errorMessageProps: DOMAttributes;
    /** Props for the popover dialog. */
    dialogProps: AriaDialogProps;
    /** Props for the range calendar within the popover dialog. */
    calendarProps: RangeCalendarProps<DateValue>;
}
/**
 * Provides the behavior and accessibility implementation for a date picker component.
 * A date range picker combines two DateFields and a RangeCalendar popover to allow
 * users to enter or select a date and time range.
 */
export function useDateRangePicker<T extends DateValue>(props: AriaDateRangePickerProps<T>, state: DateRangePickerState, ref: RefObject<Element | null>): DateRangePickerAria;
export type { AriaDateFieldProps, AriaDatePickerProps, AriaDateRangePickerProps, DateRange, DateValue, TimeValue } from '@react-types/datepicker';
export type { AriaTimeFieldProps } from '@react-types/datepicker';

//# sourceMappingURL=types.d.ts.map
