import $5rwhf$intlStringsmodulejs from "./intlStrings.module.js";
import {clearAnnouncer as $5rwhf$clearAnnouncer, announce as $5rwhf$announce} from "@react-aria/live-announcer";
import {useRef as $5rwhf$useRef, useEffect as $5rwhf$useEffect} from "react";
import {useEffectEvent as $5rwhf$useEffectEvent, useGlobalListeners as $5rwhf$useGlobalListeners} from "@react-aria/utils";
import {useLocalizedStringFormatter as $5rwhf$useLocalizedStringFormatter} from "@react-aria/i18n";


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




function $d2e8511e6f209edf$export$e908e06f4b8e3402(props) {
    const _async = (0, $5rwhf$useRef)(undefined);
    let { value: value, textValue: textValue, minValue: minValue, maxValue: maxValue, isDisabled: isDisabled, isReadOnly: isReadOnly, isRequired: isRequired, onIncrement: onIncrement, onIncrementPage: onIncrementPage, onDecrement: onDecrement, onDecrementPage: onDecrementPage, onDecrementToMin: onDecrementToMin, onIncrementToMax: onIncrementToMax } = props;
    const stringFormatter = (0, $5rwhf$useLocalizedStringFormatter)((0, ($parcel$interopDefault($5rwhf$intlStringsmodulejs))), '@react-aria/spinbutton');
    const clearAsync = ()=>clearTimeout(_async.current);
    (0, $5rwhf$useEffect)(()=>{
        return ()=>clearAsync();
    }, []);
    let onKeyDown = (e)=>{
        if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || isReadOnly) return;
        switch(e.key){
            case 'PageUp':
                if (onIncrementPage) {
                    e.preventDefault();
                    onIncrementPage === null || onIncrementPage === void 0 ? void 0 : onIncrementPage();
                    break;
                }
            // fallthrough!
            case 'ArrowUp':
            case 'Up':
                if (onIncrement) {
                    e.preventDefault();
                    onIncrement === null || onIncrement === void 0 ? void 0 : onIncrement();
                }
                break;
            case 'PageDown':
                if (onDecrementPage) {
                    e.preventDefault();
                    onDecrementPage === null || onDecrementPage === void 0 ? void 0 : onDecrementPage();
                    break;
                }
            // fallthrough
            case 'ArrowDown':
            case 'Down':
                if (onDecrement) {
                    e.preventDefault();
                    onDecrement === null || onDecrement === void 0 ? void 0 : onDecrement();
                }
                break;
            case 'Home':
                if (onDecrementToMin) {
                    e.preventDefault();
                    onDecrementToMin === null || onDecrementToMin === void 0 ? void 0 : onDecrementToMin();
                }
                break;
            case 'End':
                if (onIncrementToMax) {
                    e.preventDefault();
                    onIncrementToMax === null || onIncrementToMax === void 0 ? void 0 : onIncrementToMax();
                }
                break;
        }
    };
    let isFocused = (0, $5rwhf$useRef)(false);
    let onFocus = ()=>{
        isFocused.current = true;
    };
    let onBlur = ()=>{
        isFocused.current = false;
    };
    // Replace Unicode hyphen-minus (U+002D) with minus sign (U+2212).
    // This ensures that macOS VoiceOver announces it as "minus" even with other characters between the minus sign
    // and the number (e.g. currency symbol). Otherwise it announces nothing because it assumes the character is a hyphen.
    // In addition, replace the empty string with the word "Empty" so that iOS VoiceOver does not read "50%" for an empty field.
    let ariaTextValue = textValue === '' ? stringFormatter.format('Empty') : (textValue || `${value}`).replace('-', '\u2212');
    (0, $5rwhf$useEffect)(()=>{
        if (isFocused.current) {
            (0, $5rwhf$clearAnnouncer)('assertive');
            (0, $5rwhf$announce)(ariaTextValue, 'assertive');
        }
    }, [
        ariaTextValue
    ]);
    const onIncrementPressStart = (0, $5rwhf$useEffectEvent)((initialStepDelay)=>{
        clearAsync();
        onIncrement === null || onIncrement === void 0 ? void 0 : onIncrement();
        // Start spinning after initial delay
        _async.current = window.setTimeout(()=>{
            if (maxValue === undefined || isNaN(maxValue) || value === undefined || isNaN(value) || value < maxValue) onIncrementPressStart(60);
        }, initialStepDelay);
    });
    const onDecrementPressStart = (0, $5rwhf$useEffectEvent)((initialStepDelay)=>{
        clearAsync();
        onDecrement === null || onDecrement === void 0 ? void 0 : onDecrement();
        // Start spinning after initial delay
        _async.current = window.setTimeout(()=>{
            if (minValue === undefined || isNaN(minValue) || value === undefined || isNaN(value) || value > minValue) onDecrementPressStart(60);
        }, initialStepDelay);
    });
    let cancelContextMenu = (e)=>{
        e.preventDefault();
    };
    let { addGlobalListener: addGlobalListener, removeAllGlobalListeners: removeAllGlobalListeners } = (0, $5rwhf$useGlobalListeners)();
    return {
        spinButtonProps: {
            role: 'spinbutton',
            'aria-valuenow': value !== undefined && !isNaN(value) ? value : undefined,
            'aria-valuetext': ariaTextValue,
            'aria-valuemin': minValue,
            'aria-valuemax': maxValue,
            'aria-disabled': isDisabled || undefined,
            'aria-readonly': isReadOnly || undefined,
            'aria-required': isRequired || undefined,
            onKeyDown: onKeyDown,
            onFocus: onFocus,
            onBlur: onBlur
        },
        incrementButtonProps: {
            onPressStart: ()=>{
                onIncrementPressStart(400);
                addGlobalListener(window, 'contextmenu', cancelContextMenu);
            },
            onPressEnd: ()=>{
                clearAsync();
                removeAllGlobalListeners();
            },
            onFocus: onFocus,
            onBlur: onBlur
        },
        decrementButtonProps: {
            onPressStart: ()=>{
                onDecrementPressStart(400);
                addGlobalListener(window, 'contextmenu', cancelContextMenu);
            },
            onPressEnd: ()=>{
                clearAsync();
                removeAllGlobalListeners();
            },
            onFocus: onFocus,
            onBlur: onBlur
        }
    };
}


export {$d2e8511e6f209edf$export$e908e06f4b8e3402 as useSpinButton};
//# sourceMappingURL=useSpinButton.module.js.map
