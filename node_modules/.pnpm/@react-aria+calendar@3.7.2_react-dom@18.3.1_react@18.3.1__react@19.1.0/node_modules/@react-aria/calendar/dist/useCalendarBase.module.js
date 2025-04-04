import {hookData as $a074e1e2d0f0a665$export$653eddfc964b0f8a, useSelectedDateDescription as $a074e1e2d0f0a665$export$b6df97c887c38e1a, useVisibleRangeDescription as $a074e1e2d0f0a665$export$31afe65d91ef6e8} from "./utils.module.js";
import $g2t6q$intlStringsmodulejs from "./intlStrings.module.js";
import {announce as $g2t6q$announce} from "@react-aria/live-announcer";
import {filterDOMProps as $g2t6q$filterDOMProps, useUpdateEffect as $g2t6q$useUpdateEffect, useSlotId as $g2t6q$useSlotId, useLabels as $g2t6q$useLabels, mergeProps as $g2t6q$mergeProps} from "@react-aria/utils";
import {useLocalizedStringFormatter as $g2t6q$useLocalizedStringFormatter} from "@react-aria/i18n";
import {useState as $g2t6q$useState} from "react";


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





function $c4acc1de3ab169cf$export$d652b3ea2d672d5b(props, state) {
    let stringFormatter = (0, $g2t6q$useLocalizedStringFormatter)((0, ($parcel$interopDefault($g2t6q$intlStringsmodulejs))), '@react-aria/calendar');
    let domProps = (0, $g2t6q$filterDOMProps)(props);
    let title = (0, $a074e1e2d0f0a665$export$31afe65d91ef6e8)(state.visibleRange.start, state.visibleRange.end, state.timeZone, false);
    let visibleRangeDescription = (0, $a074e1e2d0f0a665$export$31afe65d91ef6e8)(state.visibleRange.start, state.visibleRange.end, state.timeZone, true);
    // Announce when the visible date range changes
    (0, $g2t6q$useUpdateEffect)(()=>{
        // only when pressing the Previous or Next button
        if (!state.isFocused) (0, $g2t6q$announce)(visibleRangeDescription);
    }, [
        visibleRangeDescription
    ]);
    // Announce when the selected value changes
    let selectedDateDescription = (0, $a074e1e2d0f0a665$export$b6df97c887c38e1a)(state);
    (0, $g2t6q$useUpdateEffect)(()=>{
        if (selectedDateDescription) (0, $g2t6q$announce)(selectedDateDescription, 'polite', 4000);
    // handle an update to the caption that describes the currently selected range, to announce the new value
    }, [
        selectedDateDescription
    ]);
    let errorMessageId = (0, $g2t6q$useSlotId)([
        Boolean(props.errorMessage),
        props.isInvalid,
        props.validationState
    ]);
    // Pass the label to the child grid elements.
    (0, $a074e1e2d0f0a665$export$653eddfc964b0f8a).set(state, {
        ariaLabel: props['aria-label'],
        ariaLabelledBy: props['aria-labelledby'],
        errorMessageId: errorMessageId,
        selectedDateDescription: selectedDateDescription
    });
    // If the next or previous buttons become disabled while they are focused, move focus to the calendar body.
    let [nextFocused, setNextFocused] = (0, $g2t6q$useState)(false);
    let nextDisabled = props.isDisabled || state.isNextVisibleRangeInvalid();
    if (nextDisabled && nextFocused) {
        setNextFocused(false);
        state.setFocused(true);
    }
    let [previousFocused, setPreviousFocused] = (0, $g2t6q$useState)(false);
    let previousDisabled = props.isDisabled || state.isPreviousVisibleRangeInvalid();
    if (previousDisabled && previousFocused) {
        setPreviousFocused(false);
        state.setFocused(true);
    }
    let labelProps = (0, $g2t6q$useLabels)({
        id: props['id'],
        'aria-label': [
            props['aria-label'],
            visibleRangeDescription
        ].filter(Boolean).join(', '),
        'aria-labelledby': props['aria-labelledby']
    });
    return {
        calendarProps: (0, $g2t6q$mergeProps)(domProps, labelProps, {
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


export {$c4acc1de3ab169cf$export$d652b3ea2d672d5b as useCalendarBase};
//# sourceMappingURL=useCalendarBase.module.js.map
