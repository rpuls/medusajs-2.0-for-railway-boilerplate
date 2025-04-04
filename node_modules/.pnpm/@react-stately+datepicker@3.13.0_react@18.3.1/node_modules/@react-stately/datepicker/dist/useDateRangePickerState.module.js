import {getFormatOptions as $35a22f14a1f04b11$export$7e319ea407e63bc0, getPlaceholderTime as $35a22f14a1f04b11$export$c5221a78ef73c5e9, getRangeValidationResult as $35a22f14a1f04b11$export$80ff8fc0ae339c13, useDefaultProps as $35a22f14a1f04b11$export$2440da353cedad43} from "./utils.module.js";
import {toCalendarDate as $hac8C$toCalendarDate, toCalendarDateTime as $hac8C$toCalendarDateTime, DateFormatter as $hac8C$DateFormatter} from "@internationalized/date";
import {useFormValidationState as $hac8C$useFormValidationState} from "@react-stately/form";
import {useOverlayTriggerState as $hac8C$useOverlayTriggerState} from "@react-stately/overlays";
import {useControlledState as $hac8C$useControlledState} from "@react-stately/utils";
import {useState as $hac8C$useState, useMemo as $hac8C$useMemo} from "react";

/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */ 





function $93c38a5e28be6249$export$e50a61c1de9f574(props) {
    var _value_start, _value_end;
    let overlayState = (0, $hac8C$useOverlayTriggerState)(props);
    let [controlledValue, setControlledValue] = (0, $hac8C$useControlledState)(props.value, props.defaultValue || null, props.onChange);
    let [placeholderValue, setPlaceholderValue] = (0, $hac8C$useState)(()=>controlledValue || {
            start: null,
            end: null
        });
    // Reset the placeholder if the value prop is set to null.
    if (controlledValue == null && placeholderValue.start && placeholderValue.end) {
        placeholderValue = {
            start: null,
            end: null
        };
        setPlaceholderValue(placeholderValue);
    }
    let value = controlledValue || placeholderValue;
    let setValue = (value)=>{
        setPlaceholderValue(value || {
            start: null,
            end: null
        });
        if ($93c38a5e28be6249$var$isCompleteRange(value)) setControlledValue(value);
        else setControlledValue(null);
    };
    let v = (value === null || value === void 0 ? void 0 : value.start) || (value === null || value === void 0 ? void 0 : value.end) || props.placeholderValue || null;
    let [granularity, defaultTimeZone] = (0, $35a22f14a1f04b11$export$2440da353cedad43)(v, props.granularity);
    let hasTime = granularity === 'hour' || granularity === 'minute' || granularity === 'second';
    var _props_shouldCloseOnSelect;
    let shouldCloseOnSelect = (_props_shouldCloseOnSelect = props.shouldCloseOnSelect) !== null && _props_shouldCloseOnSelect !== void 0 ? _props_shouldCloseOnSelect : true;
    let [dateRange, setSelectedDateRange] = (0, $hac8C$useState)(null);
    let [timeRange, setSelectedTimeRange] = (0, $hac8C$useState)(null);
    if (value && $93c38a5e28be6249$var$isCompleteRange(value)) {
        dateRange = value;
        if ('hour' in value.start) timeRange = value;
    }
    let commitValue = (dateRange, timeRange)=>{
        setValue({
            start: 'timeZone' in timeRange.start ? timeRange.start.set((0, $hac8C$toCalendarDate)(dateRange.start)) : (0, $hac8C$toCalendarDateTime)(dateRange.start, timeRange.start),
            end: 'timeZone' in timeRange.end ? timeRange.end.set((0, $hac8C$toCalendarDate)(dateRange.end)) : (0, $hac8C$toCalendarDateTime)(dateRange.end, timeRange.end)
        });
        setSelectedDateRange(null);
        setSelectedTimeRange(null);
        validation.commitValidation();
    };
    // Intercept setValue to make sure the Time section is not changed by date selection in Calendar
    let setDateRange = (range)=>{
        let shouldClose = typeof shouldCloseOnSelect === 'function' ? shouldCloseOnSelect() : shouldCloseOnSelect;
        if (hasTime) {
            if ($93c38a5e28be6249$var$isCompleteRange(range) && (timeRange === null || timeRange === void 0 ? void 0 : timeRange.start) && (timeRange === null || timeRange === void 0 ? void 0 : timeRange.end)) commitValue(range, {
                start: (timeRange === null || timeRange === void 0 ? void 0 : timeRange.start) || (0, $35a22f14a1f04b11$export$c5221a78ef73c5e9)(props.placeholderValue),
                end: (timeRange === null || timeRange === void 0 ? void 0 : timeRange.end) || (0, $35a22f14a1f04b11$export$c5221a78ef73c5e9)(props.placeholderValue)
            });
            else setSelectedDateRange(range);
        } else if ($93c38a5e28be6249$var$isCompleteRange(range)) {
            setValue(range);
            validation.commitValidation();
        } else setSelectedDateRange(range);
        if (shouldClose) overlayState.setOpen(false);
    };
    let setTimeRange = (range)=>{
        if ($93c38a5e28be6249$var$isCompleteRange(dateRange) && $93c38a5e28be6249$var$isCompleteRange(range)) commitValue(dateRange, range);
        else setSelectedTimeRange(range);
    };
    let showEra = (value === null || value === void 0 ? void 0 : (_value_start = value.start) === null || _value_start === void 0 ? void 0 : _value_start.calendar.identifier) === 'gregory' && value.start.era === 'BC' || (value === null || value === void 0 ? void 0 : (_value_end = value.end) === null || _value_end === void 0 ? void 0 : _value_end.calendar.identifier) === 'gregory' && value.end.era === 'BC';
    let formatOpts = (0, $hac8C$useMemo)(()=>({
            granularity: granularity,
            timeZone: defaultTimeZone,
            hideTimeZone: props.hideTimeZone,
            hourCycle: props.hourCycle,
            shouldForceLeadingZeros: props.shouldForceLeadingZeros,
            showEra: showEra
        }), [
        granularity,
        props.hourCycle,
        props.shouldForceLeadingZeros,
        defaultTimeZone,
        props.hideTimeZone,
        showEra
    ]);
    let { minValue: minValue, maxValue: maxValue, isDateUnavailable: isDateUnavailable } = props;
    let builtinValidation = (0, $hac8C$useMemo)(()=>(0, $35a22f14a1f04b11$export$80ff8fc0ae339c13)(value, minValue, maxValue, isDateUnavailable, formatOpts), [
        value,
        minValue,
        maxValue,
        isDateUnavailable,
        formatOpts
    ]);
    let validation = (0, $hac8C$useFormValidationState)({
        ...props,
        value: controlledValue,
        name: (0, $hac8C$useMemo)(()=>[
                props.startName,
                props.endName
            ].filter((n)=>n != null), [
            props.startName,
            props.endName
        ]),
        builtinValidation: builtinValidation
    });
    let isValueInvalid = validation.displayValidation.isInvalid;
    let validationState = props.validationState || (isValueInvalid ? 'invalid' : null);
    return {
        ...validation,
        value: value,
        setValue: setValue,
        dateRange: dateRange,
        timeRange: timeRange,
        granularity: granularity,
        hasTime: hasTime,
        setDate (part, date) {
            var _dateRange_end, _dateRange_start;
            if (part === 'start') setDateRange({
                start: date,
                end: (_dateRange_end = dateRange === null || dateRange === void 0 ? void 0 : dateRange.end) !== null && _dateRange_end !== void 0 ? _dateRange_end : null
            });
            else setDateRange({
                start: (_dateRange_start = dateRange === null || dateRange === void 0 ? void 0 : dateRange.start) !== null && _dateRange_start !== void 0 ? _dateRange_start : null,
                end: date
            });
        },
        setTime (part, time) {
            var _timeRange_end, _timeRange_start;
            if (part === 'start') setTimeRange({
                start: time,
                end: (_timeRange_end = timeRange === null || timeRange === void 0 ? void 0 : timeRange.end) !== null && _timeRange_end !== void 0 ? _timeRange_end : null
            });
            else setTimeRange({
                start: (_timeRange_start = timeRange === null || timeRange === void 0 ? void 0 : timeRange.start) !== null && _timeRange_start !== void 0 ? _timeRange_start : null,
                end: time
            });
        },
        setDateTime (part, dateTime) {
            var _value_end, _value_start;
            if (part === 'start') setValue({
                start: dateTime,
                end: (_value_end = value === null || value === void 0 ? void 0 : value.end) !== null && _value_end !== void 0 ? _value_end : null
            });
            else setValue({
                start: (_value_start = value === null || value === void 0 ? void 0 : value.start) !== null && _value_start !== void 0 ? _value_start : null,
                end: dateTime
            });
        },
        setDateRange: setDateRange,
        setTimeRange: setTimeRange,
        ...overlayState,
        setOpen (isOpen) {
            // Commit the selected date range when the calendar is closed. Use a placeholder time if one wasn't set.
            // If only the time range was set and not the date range, don't commit. The state will be preserved until
            // the user opens the popover again.
            if (!isOpen && !((value === null || value === void 0 ? void 0 : value.start) && (value === null || value === void 0 ? void 0 : value.end)) && $93c38a5e28be6249$var$isCompleteRange(dateRange) && hasTime) commitValue(dateRange, {
                start: (timeRange === null || timeRange === void 0 ? void 0 : timeRange.start) || (0, $35a22f14a1f04b11$export$c5221a78ef73c5e9)(props.placeholderValue),
                end: (timeRange === null || timeRange === void 0 ? void 0 : timeRange.end) || (0, $35a22f14a1f04b11$export$c5221a78ef73c5e9)(props.placeholderValue)
            });
            overlayState.setOpen(isOpen);
        },
        validationState: validationState,
        isInvalid: isValueInvalid,
        formatValue (locale, fieldOptions) {
            if (!value || !value.start || !value.end) return null;
            let startTimeZone = 'timeZone' in value.start ? value.start.timeZone : undefined;
            let startGranularity = props.granularity || (value.start && 'minute' in value.start ? 'minute' : 'day');
            let endTimeZone = 'timeZone' in value.end ? value.end.timeZone : undefined;
            let endGranularity = props.granularity || (value.end && 'minute' in value.end ? 'minute' : 'day');
            let startOptions = (0, $35a22f14a1f04b11$export$7e319ea407e63bc0)(fieldOptions, {
                granularity: startGranularity,
                timeZone: startTimeZone,
                hideTimeZone: props.hideTimeZone,
                hourCycle: props.hourCycle,
                showEra: value.start.calendar.identifier === 'gregory' && value.start.era === 'BC' || value.end.calendar.identifier === 'gregory' && value.end.era === 'BC'
            });
            let startDate = value.start.toDate(startTimeZone || 'UTC');
            let endDate = value.end.toDate(endTimeZone || 'UTC');
            let startFormatter = new (0, $hac8C$DateFormatter)(locale, startOptions);
            let endFormatter;
            if (startTimeZone === endTimeZone && startGranularity === endGranularity && value.start.compare(value.end) !== 0) {
                // Use formatRange, as it results in shorter output when some of the fields
                // are shared between the start and end dates (e.g. the same month).
                // Formatting will fail if the end date is before the start date. Fall back below when that happens.
                try {
                    let parts = startFormatter.formatRangeToParts(startDate, endDate);
                    // Find the separator between the start and end date. This is determined
                    // by finding the last shared literal before the end range.
                    let separatorIndex = -1;
                    for(let i = 0; i < parts.length; i++){
                        let part = parts[i];
                        if (part.source === 'shared' && part.type === 'literal') separatorIndex = i;
                        else if (part.source === 'endRange') break;
                    }
                    // Now we can combine the parts into start and end strings.
                    let start = '';
                    let end = '';
                    for(let i = 0; i < parts.length; i++){
                        if (i < separatorIndex) start += parts[i].value;
                        else if (i > separatorIndex) end += parts[i].value;
                    }
                    return {
                        start: start,
                        end: end
                    };
                } catch  {
                // ignore
                }
                endFormatter = startFormatter;
            } else {
                let endOptions = (0, $35a22f14a1f04b11$export$7e319ea407e63bc0)(fieldOptions, {
                    granularity: endGranularity,
                    timeZone: endTimeZone,
                    hideTimeZone: props.hideTimeZone,
                    hourCycle: props.hourCycle
                });
                endFormatter = new (0, $hac8C$DateFormatter)(locale, endOptions);
            }
            return {
                start: startFormatter.format(startDate),
                end: endFormatter.format(endDate)
            };
        },
        getDateFormatter (locale, formatOptions) {
            let newOptions = {
                ...formatOpts,
                ...formatOptions
            };
            let newFormatOptions = (0, $35a22f14a1f04b11$export$7e319ea407e63bc0)({}, newOptions);
            return new (0, $hac8C$DateFormatter)(locale, newFormatOptions);
        }
    };
}
function $93c38a5e28be6249$var$isCompleteRange(value) {
    return (value === null || value === void 0 ? void 0 : value.start) != null && value.end != null;
}


export {$93c38a5e28be6249$export$e50a61c1de9f574 as useDateRangePickerState};
//# sourceMappingURL=useDateRangePickerState.module.js.map
