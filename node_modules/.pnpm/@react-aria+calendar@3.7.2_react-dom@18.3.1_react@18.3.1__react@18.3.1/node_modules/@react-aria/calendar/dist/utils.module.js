import $3HATx$intlStringsmodulejs from "./intlStrings.module.js";
import {isSameDay as $3HATx$isSameDay, startOfMonth as $3HATx$startOfMonth, endOfMonth as $3HATx$endOfMonth} from "@internationalized/date";
import {useLocalizedStringFormatter as $3HATx$useLocalizedStringFormatter, useDateFormatter as $3HATx$useDateFormatter} from "@react-aria/i18n";
import {useMemo as $3HATx$useMemo} from "react";


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



const $a074e1e2d0f0a665$export$653eddfc964b0f8a = new WeakMap();
function $a074e1e2d0f0a665$export$134cbb7fb09a9522(date) {
    return (date === null || date === void 0 ? void 0 : date.calendar.identifier) === 'gregory' && date.era === 'BC' ? 'short' : undefined;
}
function $a074e1e2d0f0a665$export$b6df97c887c38e1a(state) {
    let stringFormatter = (0, $3HATx$useLocalizedStringFormatter)((0, ($parcel$interopDefault($3HATx$intlStringsmodulejs))), '@react-aria/calendar');
    let start, end;
    var _state_value;
    if ('highlightedRange' in state) ({ start: start, end: end } = state.highlightedRange || {});
    else start = end = (_state_value = state.value) !== null && _state_value !== void 0 ? _state_value : undefined;
    let dateFormatter = (0, $3HATx$useDateFormatter)({
        weekday: 'long',
        month: 'long',
        year: 'numeric',
        day: 'numeric',
        era: $a074e1e2d0f0a665$export$134cbb7fb09a9522(start) || $a074e1e2d0f0a665$export$134cbb7fb09a9522(end),
        timeZone: state.timeZone
    });
    let anchorDate = 'anchorDate' in state ? state.anchorDate : null;
    return (0, $3HATx$useMemo)(()=>{
        // No message if currently selecting a range, or there is nothing highlighted.
        if (!anchorDate && start && end) {
            // Use a single date message if the start and end dates are the same day,
            // otherwise include both dates.
            if ((0, $3HATx$isSameDay)(start, end)) {
                let date = dateFormatter.format(start.toDate(state.timeZone));
                return stringFormatter.format('selectedDateDescription', {
                    date: date
                });
            } else {
                let dateRange = $a074e1e2d0f0a665$var$formatRange(dateFormatter, stringFormatter, start, end, state.timeZone);
                return stringFormatter.format('selectedRangeDescription', {
                    dateRange: dateRange
                });
            }
        }
        return '';
    }, [
        start,
        end,
        anchorDate,
        state.timeZone,
        stringFormatter,
        dateFormatter
    ]);
}
function $a074e1e2d0f0a665$export$31afe65d91ef6e8(startDate, endDate, timeZone, isAria) {
    let stringFormatter = (0, $3HATx$useLocalizedStringFormatter)((0, ($parcel$interopDefault($3HATx$intlStringsmodulejs))), '@react-aria/calendar');
    let era = $a074e1e2d0f0a665$export$134cbb7fb09a9522(startDate) || $a074e1e2d0f0a665$export$134cbb7fb09a9522(endDate);
    let monthFormatter = (0, $3HATx$useDateFormatter)({
        month: 'long',
        year: 'numeric',
        era: era,
        calendar: startDate.calendar.identifier,
        timeZone: timeZone
    });
    let dateFormatter = (0, $3HATx$useDateFormatter)({
        month: 'long',
        year: 'numeric',
        day: 'numeric',
        era: era,
        calendar: startDate.calendar.identifier,
        timeZone: timeZone
    });
    return (0, $3HATx$useMemo)(()=>{
        // Special case for month granularity. Format as a single month if only a
        // single month is visible, otherwise format as a range of months.
        if ((0, $3HATx$isSameDay)(startDate, (0, $3HATx$startOfMonth)(startDate))) {
            if ((0, $3HATx$isSameDay)(endDate, (0, $3HATx$endOfMonth)(startDate))) return monthFormatter.format(startDate.toDate(timeZone));
            else if ((0, $3HATx$isSameDay)(endDate, (0, $3HATx$endOfMonth)(endDate))) return isAria ? $a074e1e2d0f0a665$var$formatRange(monthFormatter, stringFormatter, startDate, endDate, timeZone) : monthFormatter.formatRange(startDate.toDate(timeZone), endDate.toDate(timeZone));
        }
        return isAria ? $a074e1e2d0f0a665$var$formatRange(dateFormatter, stringFormatter, startDate, endDate, timeZone) : dateFormatter.formatRange(startDate.toDate(timeZone), endDate.toDate(timeZone));
    }, [
        startDate,
        endDate,
        monthFormatter,
        dateFormatter,
        stringFormatter,
        timeZone,
        isAria
    ]);
}
function $a074e1e2d0f0a665$var$formatRange(dateFormatter, stringFormatter, start, end, timeZone) {
    let parts = dateFormatter.formatRangeToParts(start.toDate(timeZone), end.toDate(timeZone));
    // Find the separator between the start and end date. This is determined
    // by finding the last shared literal before the end range.
    let separatorIndex = -1;
    for(let i = 0; i < parts.length; i++){
        let part = parts[i];
        if (part.source === 'shared' && part.type === 'literal') separatorIndex = i;
        else if (part.source === 'endRange') break;
    }
    // Now we can combine the parts into start and end strings.
    let startValue = '';
    let endValue = '';
    for(let i = 0; i < parts.length; i++){
        if (i < separatorIndex) startValue += parts[i].value;
        else if (i > separatorIndex) endValue += parts[i].value;
    }
    return stringFormatter.format('dateRange', {
        startDate: startValue,
        endDate: endValue
    });
}


export {$a074e1e2d0f0a665$export$653eddfc964b0f8a as hookData, $a074e1e2d0f0a665$export$134cbb7fb09a9522 as getEraFormat, $a074e1e2d0f0a665$export$b6df97c887c38e1a as useSelectedDateDescription, $a074e1e2d0f0a665$export$31afe65d91ef6e8 as useVisibleRangeDescription};
//# sourceMappingURL=utils.module.js.map
