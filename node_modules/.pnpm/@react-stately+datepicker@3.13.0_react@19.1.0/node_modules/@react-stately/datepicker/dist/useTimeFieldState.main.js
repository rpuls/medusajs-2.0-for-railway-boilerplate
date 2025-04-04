var $596a1f0f523d6752$exports = require("./useDateFieldState.main.js");
var $1Q50t$internationalizeddate = require("@internationalized/date");
var $1Q50t$react = require("react");
var $1Q50t$reactstatelyutils = require("@react-stately/utils");


function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "useTimeFieldState", () => $2654e87be0231a69$export$fd53cef0cc796101);
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



function $2654e87be0231a69$export$fd53cef0cc796101(props) {
    let { placeholderValue: placeholderValue = new (0, $1Q50t$internationalizeddate.Time)(), minValue: minValue, maxValue: maxValue, granularity: granularity, validate: validate } = props;
    var _props_defaultValue;
    let [value, setValue] = (0, $1Q50t$reactstatelyutils.useControlledState)(props.value, (_props_defaultValue = props.defaultValue) !== null && _props_defaultValue !== void 0 ? _props_defaultValue : null, props.onChange);
    let v = value || placeholderValue;
    let day = v && 'day' in v ? v : undefined;
    let defaultValueTimeZone = props.defaultValue && 'timeZone' in props.defaultValue ? props.defaultValue.timeZone : undefined;
    let placeholderDate = (0, $1Q50t$react.useMemo)(()=>{
        let valueTimeZone = v && 'timeZone' in v ? v.timeZone : undefined;
        return (valueTimeZone || defaultValueTimeZone) && placeholderValue ? (0, $1Q50t$internationalizeddate.toZoned)($2654e87be0231a69$var$convertValue(placeholderValue), valueTimeZone || defaultValueTimeZone) : $2654e87be0231a69$var$convertValue(placeholderValue);
    }, [
        placeholderValue,
        v,
        defaultValueTimeZone
    ]);
    let minDate = (0, $1Q50t$react.useMemo)(()=>$2654e87be0231a69$var$convertValue(minValue, day), [
        minValue,
        day
    ]);
    let maxDate = (0, $1Q50t$react.useMemo)(()=>$2654e87be0231a69$var$convertValue(maxValue, day), [
        maxValue,
        day
    ]);
    let timeValue = (0, $1Q50t$react.useMemo)(()=>value && 'day' in value ? (0, $1Q50t$internationalizeddate.toTime)(value) : value, [
        value
    ]);
    let dateTime = (0, $1Q50t$react.useMemo)(()=>value == null ? null : $2654e87be0231a69$var$convertValue(value), [
        value
    ]);
    let onChange = (newValue)=>{
        setValue(day || defaultValueTimeZone ? newValue : newValue && (0, $1Q50t$internationalizeddate.toTime)(newValue));
    };
    let state = (0, $596a1f0f523d6752$exports.useDateFieldState)({
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
        createCalendar: ()=>new (0, $1Q50t$internationalizeddate.GregorianCalendar)(),
        validate: (0, $1Q50t$react.useCallback)(()=>validate === null || validate === void 0 ? void 0 : validate(value), [
            validate,
            value
        ])
    });
    return {
        ...state,
        timeValue: timeValue
    };
}
function $2654e87be0231a69$var$convertValue(value, date = (0, $1Q50t$internationalizeddate.today)((0, $1Q50t$internationalizeddate.getLocalTimeZone)())) {
    if (!value) return null;
    if ('day' in value) return value;
    return (0, $1Q50t$internationalizeddate.toCalendarDateTime)(date, value);
}


//# sourceMappingURL=useTimeFieldState.main.js.map
