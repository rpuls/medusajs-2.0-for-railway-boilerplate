"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatePicker = void 0;
const tslib_1 = require("tslib");
const date_1 = require("@internationalized/date");
const icons_1 = require("@medusajs/icons");
const cva_1 = require("cva");
const React = tslib_1.__importStar(require("react"));
const react_aria_1 = require("react-aria");
const react_stately_1 = require("react-stately");
const calendar_1 = require("../calendar");
const popover_1 = require("../popover");
const time_input_1 = require("../time-input");
const calendar_2 = require("../../utils/calendar");
const clx_1 = require("../../utils/clx");
const date_picker_button_1 = require("./date-picker-button");
const date_picker_clear_button_1 = require("./date-picker-clear-button");
const date_picker_field_1 = require("./date-picker-field");
const datePickerStyles = (isOpen, isInvalid, value) => (0, cva_1.cva)({
    base: (0, clx_1.clx)("bg-ui-bg-field shadow-borders-base txt-compact-small text-ui-fg-base transition-fg grid items-center gap-2 overflow-hidden rounded-md h-fit", "focus-within:shadow-borders-interactive-with-active focus-visible:shadow-borders-interactive-with-active", "aria-[invalid=true]:shadow-borders-error invalid:shadow-borders-error", {
        "shadow-borders-interactive-with-active": isOpen,
        "shadow-borders-error": isInvalid,
        "pr-2": !value,
    }),
    variants: {
        size: {
            small: (0, clx_1.clx)("grid-cols-[28px_1fr]", {
                "grid-cols-[28px_1fr_28px]": !!value,
            }),
            base: (0, clx_1.clx)("grid-cols-[32px_1fr]", {
                "grid-cols-[32px_1fr_32px]": !!value,
            }),
        },
    },
});
const HAS_TIME = new Set(["hour", "minute", "second"]);
const DatePicker = React.forwardRef(({ size = "base", shouldCloseOnSelect = true, className, modal = false, ...props }, ref) => {
    const [value, setValue] = React.useState((0, calendar_2.getDefaultCalendarDateFromDate)(props.value, props.defaultValue, props.granularity));
    const innerRef = React.useRef(null);
    React.useImperativeHandle(ref, () => innerRef.current);
    const contentRef = React.useRef(null);
    const _props = convertProps(props, setValue);
    const state = (0, react_stately_1.useDatePickerState)({
        ..._props,
        shouldCloseOnSelect,
    });
    const { groupProps, fieldProps, buttonProps, dialogProps, calendarProps } = (0, react_aria_1.useDatePicker)(_props, state, innerRef);
    React.useEffect(() => {
        setValue(props.value
            ? (0, calendar_2.updateCalendarDateFromDate)(value, props.value, props.granularity)
            : null);
        state.setValue(props.value
            ? (0, calendar_2.updateCalendarDateFromDate)(value, props.value, props.granularity)
            : null);
    }, [props.value]);
    function clear(e) {
        var _a;
        e.preventDefault();
        e.stopPropagation();
        (_a = props.onChange) === null || _a === void 0 ? void 0 : _a.call(props, null);
        state.setValue(null);
    }
    (0, react_aria_1.useInteractOutside)({
        ref: contentRef,
        onInteractOutside: () => {
            state.setOpen(false);
        },
    });
    const hasTime = props.granularity && HAS_TIME.has(props.granularity);
    const Icon = hasTime ? icons_1.Clock : icons_1.CalendarMini;
    return (React.createElement(popover_1.Popover, { modal: modal, open: state.isOpen, onOpenChange: state.setOpen },
        React.createElement(popover_1.Popover.Anchor, { asChild: true },
            React.createElement("div", { ref: ref, className: (0, clx_1.clx)(datePickerStyles(state.isOpen, state.isInvalid, state.value)({ size }), className), ...groupProps },
                React.createElement(date_picker_button_1.DatePickerButton, { ...buttonProps, size: size },
                    React.createElement(Icon, null)),
                React.createElement(date_picker_field_1.DatePickerField, { ...fieldProps, size: size }),
                !!state.value && (React.createElement(date_picker_clear_button_1.DatePickerClearButton, { onClick: clear },
                    React.createElement(icons_1.XMarkMini, null))))),
        React.createElement(popover_1.Popover.Content, { ref: contentRef, ...dialogProps, className: "flex flex-col divide-y p-0" },
            React.createElement("div", { className: "p-3" },
                React.createElement(calendar_1.InternalCalendar, { autoFocus: true, ...calendarProps })),
            state.hasTime && (React.createElement("div", { className: "p-3" },
                React.createElement(time_input_1.TimeInput, { value: state.timeValue, onChange: state.setTimeValue, hourCycle: props.hourCycle }))))));
});
exports.DatePicker = DatePicker;
DatePicker.displayName = "DatePicker";
function convertProps(props, setValue) {
    const { minValue, maxValue, isDateUnavailable: _isDateUnavailable, onChange: _onChange, value: __value__, defaultValue: __defaultValue__, ...rest } = props;
    const onChange = (value) => {
        setValue(value);
        _onChange === null || _onChange === void 0 ? void 0 : _onChange(value ? value.toDate((0, date_1.getLocalTimeZone)()) : null);
    };
    const isDateUnavailable = (date) => {
        const _date = date.toDate((0, date_1.getLocalTimeZone)());
        return _isDateUnavailable ? _isDateUnavailable(_date) : false;
    };
    return {
        ...rest,
        onChange: onChange,
        isDateUnavailable,
        minValue: minValue
            ? (0, calendar_2.createCalendarDateFromDate)(minValue, props.granularity)
            : minValue,
        maxValue: maxValue
            ? (0, calendar_2.createCalendarDateFromDate)(maxValue, props.granularity)
            : maxValue,
    };
}
//# sourceMappingURL=date-picker.js.map