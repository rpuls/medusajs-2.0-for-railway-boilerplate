import {useDateFieldState as $3c0fc76039f1c516$export$60e84778edff6d26} from "./useDateFieldState.module.js";
import {Time as $2PRh3$Time, toZoned as $2PRh3$toZoned, toTime as $2PRh3$toTime, GregorianCalendar as $2PRh3$GregorianCalendar, today as $2PRh3$today, getLocalTimeZone as $2PRh3$getLocalTimeZone, toCalendarDateTime as $2PRh3$toCalendarDateTime} from "@internationalized/date";
import {useMemo as $2PRh3$useMemo, useCallback as $2PRh3$useCallback} from "react";
import {useControlledState as $2PRh3$useControlledState} from "@react-stately/utils";

/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */ 



function $eff5d8ee529ac4bb$export$fd53cef0cc796101(props) {
    let { placeholderValue: placeholderValue = new (0, $2PRh3$Time)(), minValue: minValue, maxValue: maxValue, granularity: granularity, validate: validate } = props;
    var _props_defaultValue;
    let [value, setValue] = (0, $2PRh3$useControlledState)(props.value, (_props_defaultValue = props.defaultValue) !== null && _props_defaultValue !== void 0 ? _props_defaultValue : null, props.onChange);
    let v = value || placeholderValue;
    let day = v && 'day' in v ? v : undefined;
    let defaultValueTimeZone = props.defaultValue && 'timeZone' in props.defaultValue ? props.defaultValue.timeZone : undefined;
    let placeholderDate = (0, $2PRh3$useMemo)(()=>{
        let valueTimeZone = v && 'timeZone' in v ? v.timeZone : undefined;
        return (valueTimeZone || defaultValueTimeZone) && placeholderValue ? (0, $2PRh3$toZoned)($eff5d8ee529ac4bb$var$convertValue(placeholderValue), valueTimeZone || defaultValueTimeZone) : $eff5d8ee529ac4bb$var$convertValue(placeholderValue);
    }, [
        placeholderValue,
        v,
        defaultValueTimeZone
    ]);
    let minDate = (0, $2PRh3$useMemo)(()=>$eff5d8ee529ac4bb$var$convertValue(minValue, day), [
        minValue,
        day
    ]);
    let maxDate = (0, $2PRh3$useMemo)(()=>$eff5d8ee529ac4bb$var$convertValue(maxValue, day), [
        maxValue,
        day
    ]);
    let timeValue = (0, $2PRh3$useMemo)(()=>value && 'day' in value ? (0, $2PRh3$toTime)(value) : value, [
        value
    ]);
    let dateTime = (0, $2PRh3$useMemo)(()=>value == null ? null : $eff5d8ee529ac4bb$var$convertValue(value), [
        value
    ]);
    let onChange = (newValue)=>{
        setValue(day || defaultValueTimeZone ? newValue : newValue && (0, $2PRh3$toTime)(newValue));
    };
    let state = (0, $3c0fc76039f1c516$export$60e84778edff6d26)({
        ...props,
        value: dateTime,
        defaultValue: undefined,
        minValue: minDate,
        maxValue: maxDate,
        onChange: onChange,
        granularity: granularity || 'minute',
        maxGranularity: 'hour',
        placeholderValue: placeholderDate !== null && placeholderDate !== void 0 ? placeholderDate : undefined,
        // Calendar should not matter for time fields.
        createCalendar: ()=>new (0, $2PRh3$GregorianCalendar)(),
        validate: (0, $2PRh3$useCallback)(()=>validate === null || validate === void 0 ? void 0 : validate(value), [
            validate,
            value
        ])
    });
    return {
        ...state,
        timeValue: timeValue
    };
}
function $eff5d8ee529ac4bb$var$convertValue(value, date = (0, $2PRh3$today)((0, $2PRh3$getLocalTimeZone)())) {
    if (!value) return null;
    if ('day' in value) return value;
    return (0, $2PRh3$toCalendarDateTime)(date, value);
}


export {$eff5d8ee529ac4bb$export$fd53cef0cc796101 as useTimeFieldState};
//# sourceMappingURL=useTimeFieldState.module.js.map
