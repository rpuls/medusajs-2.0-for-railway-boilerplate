"use client";
import { getLocalTimeZone, } from "@internationalized/date";
import { CalendarMini, Clock, XMarkMini } from "@medusajs/icons";
import { cva } from "cva";
import * as React from "react";
import { useDatePicker, useInteractOutside, } from "react-aria";
import { useDatePickerState } from "react-stately";
import { InternalCalendar } from "../calendar";
import { Popover } from "../popover";
import { TimeInput } from "../time-input";
import { createCalendarDateFromDate, getDefaultCalendarDateFromDate, updateCalendarDateFromDate, } from "../../utils/calendar";
import { clx } from "../../utils/clx";
import { DatePickerButton } from "./date-picker-button";
import { DatePickerClearButton } from "./date-picker-clear-button";
import { DatePickerField } from "./date-picker-field";
const datePickerStyles = (isOpen, isInvalid, value) => cva({
    base: clx("bg-ui-bg-field shadow-borders-base txt-compact-small text-ui-fg-base transition-fg grid items-center gap-2 overflow-hidden rounded-md h-fit", "focus-within:shadow-borders-interactive-with-active focus-visible:shadow-borders-interactive-with-active", "aria-[invalid=true]:shadow-borders-error invalid:shadow-borders-error", {
        "shadow-borders-interactive-with-active": isOpen,
        "shadow-borders-error": isInvalid,
        "pr-2": !value,
    }),
    variants: {
        size: {
            small: clx("grid-cols-[28px_1fr]", {
                "grid-cols-[28px_1fr_28px]": !!value,
            }),
            base: clx("grid-cols-[32px_1fr]", {
                "grid-cols-[32px_1fr_32px]": !!value,
            }),
        },
    },
});
const HAS_TIME = new Set(["hour", "minute", "second"]);
const DatePicker = React.forwardRef(({ size = "base", shouldCloseOnSelect = true, className, modal = false, ...props }, ref) => {
    const [value, setValue] = React.useState(getDefaultCalendarDateFromDate(props.value, props.defaultValue, props.granularity));
    const innerRef = React.useRef(null);
    React.useImperativeHandle(ref, () => innerRef.current);
    const contentRef = React.useRef(null);
    const _props = convertProps(props, setValue);
    const state = useDatePickerState({
        ..._props,
        shouldCloseOnSelect,
    });
    const { groupProps, fieldProps, buttonProps, dialogProps, calendarProps } = useDatePicker(_props, state, innerRef);
    React.useEffect(() => {
        setValue(props.value
            ? updateCalendarDateFromDate(value, props.value, props.granularity)
            : null);
        state.setValue(props.value
            ? updateCalendarDateFromDate(value, props.value, props.granularity)
            : null);
    }, [props.value]);
    function clear(e) {
        var _a;
        e.preventDefault();
        e.stopPropagation();
        (_a = props.onChange) === null || _a === void 0 ? void 0 : _a.call(props, null);
        state.setValue(null);
    }
    useInteractOutside({
        ref: contentRef,
        onInteractOutside: () => {
            state.setOpen(false);
        },
    });
    const hasTime = props.granularity && HAS_TIME.has(props.granularity);
    const Icon = hasTime ? Clock : CalendarMini;
    return (React.createElement(Popover, { modal: modal, open: state.isOpen, onOpenChange: state.setOpen },
        React.createElement(Popover.Anchor, { asChild: true },
            React.createElement("div", { ref: ref, className: clx(datePickerStyles(state.isOpen, state.isInvalid, state.value)({ size }), className), ...groupProps },
                React.createElement(DatePickerButton, { ...buttonProps, size: size },
                    React.createElement(Icon, null)),
                React.createElement(DatePickerField, { ...fieldProps, size: size }),
                !!state.value && (React.createElement(DatePickerClearButton, { onClick: clear },
                    React.createElement(XMarkMini, null))))),
        React.createElement(Popover.Content, { ref: contentRef, ...dialogProps, className: "flex flex-col divide-y p-0" },
            React.createElement("div", { className: "p-3" },
                React.createElement(InternalCalendar, { autoFocus: true, ...calendarProps })),
            state.hasTime && (React.createElement("div", { className: "p-3" },
                React.createElement(TimeInput, { value: state.timeValue, onChange: state.setTimeValue, hourCycle: props.hourCycle }))))));
});
DatePicker.displayName = "DatePicker";
function convertProps(props, setValue) {
    const { minValue, maxValue, isDateUnavailable: _isDateUnavailable, onChange: _onChange, value: __value__, defaultValue: __defaultValue__, ...rest } = props;
    const onChange = (value) => {
        setValue(value);
        _onChange === null || _onChange === void 0 ? void 0 : _onChange(value ? value.toDate(getLocalTimeZone()) : null);
    };
    const isDateUnavailable = (date) => {
        const _date = date.toDate(getLocalTimeZone());
        return _isDateUnavailable ? _isDateUnavailable(_date) : false;
    };
    return {
        ...rest,
        onChange: onChange,
        isDateUnavailable,
        minValue: minValue
            ? createCalendarDateFromDate(minValue, props.granularity)
            : minValue,
        maxValue: maxValue
            ? createCalendarDateFromDate(maxValue, props.granularity)
            : maxValue,
    };
}
export { DatePicker };
//# sourceMappingURL=date-picker.js.map