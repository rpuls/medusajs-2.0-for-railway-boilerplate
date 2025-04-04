var $df1d8e967e73ec8e$exports = require("./utils.main.js");
var $bd6dc95a3c5ee5cd$exports = require("./intlStrings.main.js");
var $dPWPO$reactarialiveannouncer = require("@react-aria/live-announcer");
var $dPWPO$reactariautils = require("@react-aria/utils");
var $dPWPO$reactariai18n = require("@react-aria/i18n");
var $dPWPO$react = require("react");


function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}

function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "useCalendarBase", () => $02ef492a56b91cb2$export$d652b3ea2d672d5b);
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





function $02ef492a56b91cb2$export$d652b3ea2d672d5b(props, state) {
    let stringFormatter = (0, $dPWPO$reactariai18n.useLocalizedStringFormatter)((0, ($parcel$interopDefault($bd6dc95a3c5ee5cd$exports))), '@react-aria/calendar');
    let domProps = (0, $dPWPO$reactariautils.filterDOMProps)(props);
    let title = (0, $df1d8e967e73ec8e$exports.useVisibleRangeDescription)(state.visibleRange.start, state.visibleRange.end, state.timeZone, false);
    let visibleRangeDescription = (0, $df1d8e967e73ec8e$exports.useVisibleRangeDescription)(state.visibleRange.start, state.visibleRange.end, state.timeZone, true);
    // Announce when the visible date range changes
    (0, $dPWPO$reactariautils.useUpdateEffect)(()=>{
        // only when pressing the Previous or Next button
        if (!state.isFocused) (0, $dPWPO$reactarialiveannouncer.announce)(visibleRangeDescription);
    }, [
        visibleRangeDescription
    ]);
    // Announce when the selected value changes
    let selectedDateDescription = (0, $df1d8e967e73ec8e$exports.useSelectedDateDescription)(state);
    (0, $dPWPO$reactariautils.useUpdateEffect)(()=>{
        if (selectedDateDescription) (0, $dPWPO$reactarialiveannouncer.announce)(selectedDateDescription, 'polite', 4000);
    // handle an update to the caption that describes the currently selected range, to announce the new value
    }, [
        selectedDateDescription
    ]);
    let errorMessageId = (0, $dPWPO$reactariautils.useSlotId)([
        Boolean(props.errorMessage),
        props.isInvalid,
        props.validationState
    ]);
    // Pass the label to the child grid elements.
    (0, $df1d8e967e73ec8e$exports.hookData).set(state, {
        ariaLabel: props['aria-label'],
        ariaLabelledBy: props['aria-labelledby'],
        errorMessageId: errorMessageId,
        selectedDateDescription: selectedDateDescription
    });
    // If the next or previous buttons become disabled while they are focused, move focus to the calendar body.
    let [nextFocused, setNextFocused] = (0, $dPWPO$react.useState)(false);
    let nextDisabled = props.isDisabled || state.isNextVisibleRangeInvalid();
    if (nextDisabled && nextFocused) {
        setNextFocused(false);
        state.setFocused(true);
    }
    let [previousFocused, setPreviousFocused] = (0, $dPWPO$react.useState)(false);
    let previousDisabled = props.isDisabled || state.isPreviousVisibleRangeInvalid();
    if (previousDisabled && previousFocused) {
        setPreviousFocused(false);
        state.setFocused(true);
    }
    let labelProps = (0, $dPWPO$reactariautils.useLabels)({
        id: props['id'],
        'aria-label': [
            props['aria-label'],
            visibleRangeDescription
        ].filter(Boolean).join(', '),
        'aria-labelledby': props['aria-labelledby']
    });
    return {
        calendarProps: (0, $dPWPO$reactariautils.mergeProps)(domProps, labelProps, {
            role: 'application',
            'aria-describedby': props['aria-describedby'] || undefined
        }),
        nextButtonProps: {
            onPress: ()=>state.focusNextPage(),
            'aria-label': stringFormatter.format('next'),
            isDisabled: nextDisabled,
            onFocusChange: setNextFocused
        },
        prevButtonProps: {
            onPress: ()=>state.focusPreviousPage(),
            'aria-label': stringFormatter.format('previous'),
            isDisabled: previousDisabled,
            onFocusChange: setPreviousFocused
        },
        errorMessageProps: {
            id: errorMessageId
        },
        title: title
    };
}


//# sourceMappingURL=useCalendarBase.main.js.map
