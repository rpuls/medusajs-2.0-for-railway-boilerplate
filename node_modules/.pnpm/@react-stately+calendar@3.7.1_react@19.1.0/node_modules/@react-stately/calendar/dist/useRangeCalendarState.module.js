import {alignCenter as $f62d864046160412$export$f4a51ff076cc9a09, constrainValue as $f62d864046160412$export$4f5203c0d889109e, isInvalid as $f62d864046160412$export$eac50920cf2fd59a, previousAvailableDate as $f62d864046160412$export$a1d3911297b952d7} from "./utils.module.js";
import {useCalendarState as $131cf43a05231e1e$export$6d095e787d2b5e1f} from "./useCalendarState.module.js";
import {toCalendarDate as $d0gbl$toCalendarDate, maxDate as $d0gbl$maxDate, minDate as $d0gbl$minDate, isEqualDay as $d0gbl$isEqualDay, toCalendar as $d0gbl$toCalendar, GregorianCalendar as $d0gbl$GregorianCalendar} from "@internationalized/date";
import {useControlledState as $d0gbl$useControlledState} from "@react-stately/utils";
import {useState as $d0gbl$useState, useRef as $d0gbl$useRef, useMemo as $d0gbl$useMemo} from "react";

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




function $9a36b6ba2fb1a7c5$export$9a987164d97ecc90(props) {
    let { value: valueProp, defaultValue: defaultValue, onChange: onChange, createCalendar: createCalendar, locale: locale, visibleDuration: visibleDuration = {
        months: 1
    }, minValue: minValue, maxValue: maxValue, ...calendarProps } = props;
    let [value, setValue] = (0, $d0gbl$useControlledState)(valueProp, defaultValue || null, onChange);
    let [anchorDate, setAnchorDateState] = (0, $d0gbl$useState)(null);
    let alignment = 'center';
    if (value && value.start && value.end) {
        let start = (0, $f62d864046160412$export$f4a51ff076cc9a09)((0, $d0gbl$toCalendarDate)(value.start), visibleDuration, locale, minValue, maxValue);
        let end = start.add(visibleDuration).subtract({
            days: 1
        });
        if (value.end.compare(end) > 0) alignment = 'start';
    }
    // Available range must be stored in a ref so we have access to the updated version immediately in `isInvalid`.
    let availableRangeRef = (0, $d0gbl$useRef)(null);
    let [availableRange, setAvailableRange] = (0, $d0gbl$useState)(null);
    let min = (0, $d0gbl$useMemo)(()=>(0, $d0gbl$maxDate)(minValue, availableRange === null || availableRange === void 0 ? void 0 : availableRange.start), [
        minValue,
        availableRange
    ]);
    let max = (0, $d0gbl$useMemo)(()=>(0, $d0gbl$minDate)(maxValue, availableRange === null || availableRange === void 0 ? void 0 : availableRange.end), [
        maxValue,
        availableRange
    ]);
    let calendar = (0, $131cf43a05231e1e$export$6d095e787d2b5e1f)({
        ...calendarProps,
        value: value && value.start,
        createCalendar: createCalendar,
        locale: locale,
        visibleDuration: visibleDuration,
        minValue: min,
        maxValue: max,
        selectionAlignment: alignment
    });
    let updateAvailableRange = (date)=>{
        if (date && props.isDateUnavailable && !props.allowsNonContiguousRanges) {
            const nextAvailableStartDate = $9a36b6ba2fb1a7c5$var$nextUnavailableDate(date, calendar, -1);
            const nextAvailableEndDate = $9a36b6ba2fb1a7c5$var$nextUnavailableDate(date, calendar, 1);
            availableRangeRef.current = {
                start: nextAvailableStartDate,
                end: nextAvailableEndDate
            };
            setAvailableRange(availableRangeRef.current);
        } else {
            availableRangeRef.current = null;
            setAvailableRange(null);
        }
    };
    // If the visible range changes, we need to update the available range.
    let [lastVisibleRange, setLastVisibleRange] = (0, $d0gbl$useState)(calendar.visibleRange);
    if (!(0, $d0gbl$isEqualDay)(calendar.visibleRange.start, lastVisibleRange.start) || !(0, $d0gbl$isEqualDay)(calendar.visibleRange.end, lastVisibleRange.end)) {
        updateAvailableRange(anchorDate);
        setLastVisibleRange(calendar.visibleRange);
    }
    let setAnchorDate = (date)=>{
        if (date) {
            setAnchorDateState(date);
            updateAvailableRange(date);
        } else {
            setAnchorDateState(null);
            updateAvailableRange(null);
        }
    };
    let highlightedRange = anchorDate ? $9a36b6ba2fb1a7c5$var$makeRange(anchorDate, calendar.focusedDate) : value && $9a36b6ba2fb1a7c5$var$makeRange(value.start, value.end);
    let selectDate = (date)=>{
        if (props.isReadOnly) return;
        const constrainedDate = (0, $f62d864046160412$export$4f5203c0d889109e)(date, min, max);
        const previousAvailableConstrainedDate = (0, $f62d864046160412$export$a1d3911297b952d7)(constrainedDate, calendar.visibleRange.start, props.isDateUnavailable);
        if (!previousAvailableConstrainedDate) return;
        if (!anchorDate) setAnchorDate(previousAvailableConstrainedDate);
        else {
            let range = $9a36b6ba2fb1a7c5$var$makeRange(anchorDate, previousAvailableConstrainedDate);
            if (range) setValue({
                start: $9a36b6ba2fb1a7c5$var$convertValue(range.start, value === null || value === void 0 ? void 0 : value.start),
                end: $9a36b6ba2fb1a7c5$var$convertValue(range.end, value === null || value === void 0 ? void 0 : value.end)
            });
            setAnchorDate(null);
        }
    };
    let [isDragging, setDragging] = (0, $d0gbl$useState)(false);
    let { isDateUnavailable: isDateUnavailable } = props;
    let isInvalidSelection = (0, $d0gbl$useMemo)(()=>{
        if (!value || anchorDate) return false;
        if (isDateUnavailable && (isDateUnavailable(value.start) || isDateUnavailable(value.end))) return true;
        return (0, $f62d864046160412$export$eac50920cf2fd59a)(value.start, minValue, maxValue) || (0, $f62d864046160412$export$eac50920cf2fd59a)(value.end, minValue, maxValue);
    }, [
        isDateUnavailable,
        value,
        anchorDate,
        minValue,
        maxValue
    ]);
    let isValueInvalid = props.isInvalid || props.validationState === 'invalid' || isInvalidSelection;
    let validationState = isValueInvalid ? 'invalid' : null;
    return {
        ...calendar,
        value: value,
        setValue: setValue,
        anchorDate: anchorDate,
        setAnchorDate: setAnchorDate,
        highlightedRange: highlightedRange,
        validationState: validationState,
        isValueInvalid: isValueInvalid,
        selectFocusedDate () {
            selectDate(calendar.focusedDate);
        },
        selectDate: selectDate,
        highlightDate (date) {
            if (anchorDate) calendar.setFocusedDate(date);
        },
        isSelected (date) {
            return Boolean(highlightedRange && date.compare(highlightedRange.start) >= 0 && date.compare(highlightedRange.end) <= 0 && !calendar.isCellDisabled(date) && !calendar.isCellUnavailable(date));
        },
        isInvalid (date) {
            var _availableRangeRef_current, _availableRangeRef_current1;
            return calendar.isInvalid(date) || (0, $f62d864046160412$export$eac50920cf2fd59a)(date, (_availableRangeRef_current = availableRangeRef.current) === null || _availableRangeRef_current === void 0 ? void 0 : _availableRangeRef_current.start, (_availableRangeRef_current1 = availableRangeRef.current) === null || _availableRangeRef_current1 === void 0 ? void 0 : _availableRangeRef_current1.end);
        },
        isDragging: isDragging,
        setDragging: setDragging
    };
}
function $9a36b6ba2fb1a7c5$var$makeRange(start, end) {
    if (!start || !end) return null;
    if (end.compare(start) < 0) [start, end] = [
        end,
        start
    ];
    return {
        start: (0, $d0gbl$toCalendarDate)(start),
        end: (0, $d0gbl$toCalendarDate)(end)
    };
}
function $9a36b6ba2fb1a7c5$var$convertValue(newValue, oldValue) {
    // The display calendar should not have any effect on the emitted value.
    // Emit dates in the same calendar as the original value, if any, otherwise gregorian.
    newValue = (0, $d0gbl$toCalendar)(newValue, (oldValue === null || oldValue === void 0 ? void 0 : oldValue.calendar) || new (0, $d0gbl$GregorianCalendar)());
    // Preserve time if the input value had one.
    if (oldValue && 'hour' in oldValue) return oldValue.set(newValue);
    return newValue;
}
function $9a36b6ba2fb1a7c5$var$nextUnavailableDate(anchorDate, state, dir) {
    let nextDate = anchorDate.add({
        days: dir
    });
    while((dir < 0 ? nextDate.compare(state.visibleRange.start) >= 0 : nextDate.compare(state.visibleRange.end) <= 0) && !state.isCellUnavailable(nextDate))nextDate = nextDate.add({
        days: dir
    });
    if (state.isCellUnavailable(nextDate)) return nextDate.add({
        days: -dir
    });
}


export {$9a36b6ba2fb1a7c5$export$9a987164d97ecc90 as useRangeCalendarState};
//# sourceMappingURL=useRangeCalendarState.module.js.map
