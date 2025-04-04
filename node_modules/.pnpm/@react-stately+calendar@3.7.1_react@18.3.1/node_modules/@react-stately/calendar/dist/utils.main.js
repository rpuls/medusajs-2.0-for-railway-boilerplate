var $i2P57$internationalizeddate = require("@internationalized/date");


function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "isInvalid", () => $4301262d71f567b9$export$eac50920cf2fd59a);
$parcel$export(module.exports, "alignCenter", () => $4301262d71f567b9$export$f4a51ff076cc9a09);
$parcel$export(module.exports, "alignStart", () => $4301262d71f567b9$export$144a00ba6044eb9);
$parcel$export(module.exports, "constrainStart", () => $4301262d71f567b9$export$5bb865b12696a77d);
$parcel$export(module.exports, "alignEnd", () => $4301262d71f567b9$export$530edbfc915b2b04);
$parcel$export(module.exports, "constrainValue", () => $4301262d71f567b9$export$4f5203c0d889109e);
$parcel$export(module.exports, "previousAvailableDate", () => $4301262d71f567b9$export$a1d3911297b952d7);
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
function $4301262d71f567b9$export$eac50920cf2fd59a(date, minValue, maxValue) {
    return minValue != null && date.compare(minValue) < 0 || maxValue != null && date.compare(maxValue) > 0;
}
function $4301262d71f567b9$export$f4a51ff076cc9a09(date, duration, locale, minValue, maxValue) {
    let halfDuration = {};
    for(let key in duration){
        halfDuration[key] = Math.floor(duration[key] / 2);
        if (halfDuration[key] > 0 && duration[key] % 2 === 0) halfDuration[key]--;
    }
    let aligned = $4301262d71f567b9$export$144a00ba6044eb9(date, duration, locale).subtract(halfDuration);
    return $4301262d71f567b9$export$5bb865b12696a77d(date, aligned, duration, locale, minValue, maxValue);
}
function $4301262d71f567b9$export$144a00ba6044eb9(date, duration, locale, minValue, maxValue) {
    // align to the start of the largest unit
    let aligned = date;
    if (duration.years) aligned = (0, $i2P57$internationalizeddate.startOfYear)(date);
    else if (duration.months) aligned = (0, $i2P57$internationalizeddate.startOfMonth)(date);
    else if (duration.weeks) aligned = (0, $i2P57$internationalizeddate.startOfWeek)(date, locale);
    return $4301262d71f567b9$export$5bb865b12696a77d(date, aligned, duration, locale, minValue, maxValue);
}
function $4301262d71f567b9$export$530edbfc915b2b04(date, duration, locale, minValue, maxValue) {
    let d = {
        ...duration
    };
    // subtract 1 from the smallest unit
    if (d.days) d.days--;
    else if (d.weeks) d.weeks--;
    else if (d.months) d.months--;
    else if (d.years) d.years--;
    let aligned = $4301262d71f567b9$export$144a00ba6044eb9(date, duration, locale).subtract(d);
    return $4301262d71f567b9$export$5bb865b12696a77d(date, aligned, duration, locale, minValue, maxValue);
}
function $4301262d71f567b9$export$5bb865b12696a77d(date, aligned, duration, locale, minValue, maxValue) {
    if (minValue && date.compare(minValue) >= 0) {
        let newDate = (0, $i2P57$internationalizeddate.maxDate)(aligned, $4301262d71f567b9$export$144a00ba6044eb9((0, $i2P57$internationalizeddate.toCalendarDate)(minValue), duration, locale));
        if (newDate) aligned = newDate;
    }
    if (maxValue && date.compare(maxValue) <= 0) {
        let newDate = (0, $i2P57$internationalizeddate.minDate)(aligned, $4301262d71f567b9$export$530edbfc915b2b04((0, $i2P57$internationalizeddate.toCalendarDate)(maxValue), duration, locale));
        if (newDate) aligned = newDate;
    }
    return aligned;
}
function $4301262d71f567b9$export$4f5203c0d889109e(date, minValue, maxValue) {
    if (minValue) {
        let newDate = (0, $i2P57$internationalizeddate.maxDate)(date, (0, $i2P57$internationalizeddate.toCalendarDate)(minValue));
        if (newDate) date = newDate;
    }
    if (maxValue) {
        let newDate = (0, $i2P57$internationalizeddate.minDate)(date, (0, $i2P57$internationalizeddate.toCalendarDate)(maxValue));
        if (newDate) date = newDate;
    }
    return date;
}
function $4301262d71f567b9$export$a1d3911297b952d7(date, minValue, isDateUnavailable) {
    if (!isDateUnavailable) return date;
    while(date.compare(minValue) >= 0 && isDateUnavailable(date))date = date.subtract({
        days: 1
    });
    if (date.compare(minValue) >= 0) return date;
    return null;
}


//# sourceMappingURL=utils.main.js.map
