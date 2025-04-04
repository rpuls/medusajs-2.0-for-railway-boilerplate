import $bUJMr$intlStringsmodulejs from "./intlStrings.module.js";
import {DateFormatter as $bUJMr$DateFormatter, Time as $bUJMr$Time, toCalendar as $bUJMr$toCalendar, now as $bUJMr$now, getLocalTimeZone as $bUJMr$getLocalTimeZone, toCalendarDate as $bUJMr$toCalendarDate, toCalendarDateTime as $bUJMr$toCalendarDateTime} from "@internationalized/date";
import {LocalizedStringDictionary as $bUJMr$LocalizedStringDictionary, LocalizedStringFormatter as $bUJMr$LocalizedStringFormatter} from "@internationalized/string";
import {mergeValidation as $bUJMr$mergeValidation, VALID_VALIDITY_STATE as $bUJMr$VALID_VALIDITY_STATE} from "@react-stately/form";
import {useState as $bUJMr$useState} from "react";


function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}
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




const $35a22f14a1f04b11$var$dictionary = new (0, $bUJMr$LocalizedStringDictionary)((0, ($parcel$interopDefault($bUJMr$intlStringsmodulejs))));
function $35a22f14a1f04b11$var$getLocale() {
    // Match browser language setting here, NOT react-aria's I18nProvider, so that we match other browser-provided
    // validation messages, which to not respect our provider's language.
    // @ts-ignore
    return typeof navigator !== 'undefined' && (navigator.language || navigator.userLanguage) || 'en-US';
}
function $35a22f14a1f04b11$export$f18627323ab57ac0(value, minValue, maxValue, isDateUnavailable, options) {
    let rangeOverflow = value != null && maxValue != null && value.compare(maxValue) > 0;
    let rangeUnderflow = value != null && minValue != null && value.compare(minValue) < 0;
    let isUnavailable = value != null && (isDateUnavailable === null || isDateUnavailable === void 0 ? void 0 : isDateUnavailable(value)) || false;
    let isInvalid = rangeOverflow || rangeUnderflow || isUnavailable;
    let errors = [];
    if (isInvalid) {
        let locale = $35a22f14a1f04b11$var$getLocale();
        let strings = (0, $bUJMr$LocalizedStringDictionary).getGlobalDictionaryForPackage('@react-stately/datepicker') || $35a22f14a1f04b11$var$dictionary;
        let formatter = new (0, $bUJMr$LocalizedStringFormatter)(locale, strings);
        let dateFormatter = new (0, $bUJMr$DateFormatter)(locale, $35a22f14a1f04b11$export$7e319ea407e63bc0({}, options));
        let timeZone = dateFormatter.resolvedOptions().timeZone;
        if (rangeUnderflow && minValue != null) errors.push(formatter.format('rangeUnderflow', {
            minValue: dateFormatter.format(minValue.toDate(timeZone))
        }));
        if (rangeOverflow && maxValue != null) errors.push(formatter.format('rangeOverflow', {
            maxValue: dateFormatter.format(maxValue.toDate(timeZone))
        }));
        if (isUnavailable) errors.push(formatter.format('unavailableDate'));
    }
    return {
        isInvalid: isInvalid,
        validationErrors: errors,
        validationDetails: {
            badInput: isUnavailable,
            customError: false,
            patternMismatch: false,
            rangeOverflow: rangeOverflow,
            rangeUnderflow: rangeUnderflow,
            stepMismatch: false,
            tooLong: false,
            tooShort: false,
            typeMismatch: false,
            valueMissing: false,
            valid: !isInvalid
        }
    };
}
function $35a22f14a1f04b11$export$80ff8fc0ae339c13(value, minValue, maxValue, isDateUnavailable, options) {
    var _value_start;
    let startValidation = $35a22f14a1f04b11$export$f18627323ab57ac0((_value_start = value === null || value === void 0 ? void 0 : value.start) !== null && _value_start !== void 0 ? _value_start : null, minValue, maxValue, isDateUnavailable, options);
    var _value_end;
    let endValidation = $35a22f14a1f04b11$export$f18627323ab57ac0((_value_end = value === null || value === void 0 ? void 0 : value.end) !== null && _value_end !== void 0 ? _value_end : null, minValue, maxValue, isDateUnavailable, options);
    let result = (0, $bUJMr$mergeValidation)(startValidation, endValidation);
    if ((value === null || value === void 0 ? void 0 : value.end) != null && value.start != null && value.end.compare(value.start) < 0) {
        let strings = (0, $bUJMr$LocalizedStringDictionary).getGlobalDictionaryForPackage('@react-stately/datepicker') || $35a22f14a1f04b11$var$dictionary;
        result = (0, $bUJMr$mergeValidation)(result, {
            isInvalid: true,
            validationErrors: [
                strings.getStringForLocale('rangeReversed', $35a22f14a1f04b11$var$getLocale())
            ],
            validationDetails: {
                ...(0, $bUJMr$VALID_VALIDITY_STATE),
                rangeUnderflow: true,
                rangeOverflow: true,
                valid: false
            }
        });
    }
    return result;
}
const $35a22f14a1f04b11$var$DEFAULT_FIELD_OPTIONS = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit'
};
const $35a22f14a1f04b11$var$TWO_DIGIT_FIELD_OPTIONS = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
};
function $35a22f14a1f04b11$export$7e319ea407e63bc0(fieldOptions, options) {
    let defaultFieldOptions = options.shouldForceLeadingZeros ? $35a22f14a1f04b11$var$TWO_DIGIT_FIELD_OPTIONS : $35a22f14a1f04b11$var$DEFAULT_FIELD_OPTIONS;
    fieldOptions = {
        ...defaultFieldOptions,
        ...fieldOptions
    };
    let granularity = options.granularity || 'minute';
    let keys = Object.keys(fieldOptions);
    var _options_maxGranularity;
    let startIdx = keys.indexOf((_options_maxGranularity = options.maxGranularity) !== null && _options_maxGranularity !== void 0 ? _options_maxGranularity : 'year');
    if (startIdx < 0) startIdx = 0;
    let endIdx = keys.indexOf(granularity);
    if (endIdx < 0) endIdx = 2;
    if (startIdx > endIdx) throw new Error('maxGranularity must be greater than granularity');
    let opts = keys.slice(startIdx, endIdx + 1).reduce((opts, key)=>{
        opts[key] = fieldOptions[key];
        return opts;
    }, {});
    if (options.hourCycle != null) opts.hour12 = options.hourCycle === 12;
    opts.timeZone = options.timeZone || 'UTC';
    let hasTime = granularity === 'hour' || granularity === 'minute' || granularity === 'second';
    if (hasTime && options.timeZone && !options.hideTimeZone) opts.timeZoneName = 'short';
    if (options.showEra && startIdx === 0) opts.era = 'short';
    return opts;
}
function $35a22f14a1f04b11$export$c5221a78ef73c5e9(placeholderValue) {
    if (placeholderValue && 'hour' in placeholderValue) return placeholderValue;
    return new (0, $bUJMr$Time)();
}
function $35a22f14a1f04b11$export$61a490a80c552550(value, calendar) {
    if (value === null) return null;
    if (!value) return undefined;
    return (0, $bUJMr$toCalendar)(value, calendar);
}
function $35a22f14a1f04b11$export$66aa2b09de4b1ea5(placeholderValue, granularity, calendar, timeZone) {
    if (placeholderValue) return $35a22f14a1f04b11$export$61a490a80c552550(placeholderValue, calendar);
    let date = (0, $bUJMr$toCalendar)((0, $bUJMr$now)(timeZone !== null && timeZone !== void 0 ? timeZone : (0, $bUJMr$getLocalTimeZone)()).set({
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0
    }), calendar);
    if (granularity === 'year' || granularity === 'month' || granularity === 'day') return (0, $bUJMr$toCalendarDate)(date);
    if (!timeZone) return (0, $bUJMr$toCalendarDateTime)(date);
    return date;
}
function $35a22f14a1f04b11$export$2440da353cedad43(v, granularity) {
    // Compute default granularity and time zone from the value. If the value becomes null, keep the last values.
    let defaultTimeZone = v && 'timeZone' in v ? v.timeZone : undefined;
    let defaultGranularity = v && 'minute' in v ? 'minute' : 'day';
    // props.granularity must actually exist in the value if one is provided.
    if (v && granularity && !(granularity in v)) throw new Error('Invalid granularity ' + granularity + ' for value ' + v.toString());
    let [lastValue, setLastValue] = (0, $bUJMr$useState)([
        defaultGranularity,
        defaultTimeZone
    ]);
    // If the granularity or time zone changed, update the last value.
    if (v && (lastValue[0] !== defaultGranularity || lastValue[1] !== defaultTimeZone)) setLastValue([
        defaultGranularity,
        defaultTimeZone
    ]);
    if (!granularity) granularity = v ? defaultGranularity : lastValue[0];
    let timeZone = v ? defaultTimeZone : lastValue[1];
    return [
        granularity,
        timeZone
    ];
}


export {$35a22f14a1f04b11$export$f18627323ab57ac0 as getValidationResult, $35a22f14a1f04b11$export$7e319ea407e63bc0 as getFormatOptions, $35a22f14a1f04b11$export$80ff8fc0ae339c13 as getRangeValidationResult, $35a22f14a1f04b11$export$c5221a78ef73c5e9 as getPlaceholderTime, $35a22f14a1f04b11$export$61a490a80c552550 as convertValue, $35a22f14a1f04b11$export$66aa2b09de4b1ea5 as createPlaceholderDate, $35a22f14a1f04b11$export$2440da353cedad43 as useDefaultProps};
//# sourceMappingURL=utils.module.js.map
