import {parseColor as $799cddbef784668f$export$6e865ea70d7724f} from "./Color.mjs";
import {useColor as $aa90ad8b2b1d015f$export$5aadd9c0606af5c2} from "./useColor.mjs";
import {useFormValidationState as $aP5W6$useFormValidationState} from "@react-stately/form";
import {useControlledState as $aP5W6$useControlledState} from "@react-stately/utils";
import {useState as $aP5W6$useState, useMemo as $aP5W6$useMemo} from "react";

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




const $b335ada08155d9c0$var$MIN_COLOR = (0, $799cddbef784668f$export$6e865ea70d7724f)('#000000');
const $b335ada08155d9c0$var$MAX_COLOR = (0, $799cddbef784668f$export$6e865ea70d7724f)('#FFFFFF');
const $b335ada08155d9c0$var$MIN_COLOR_INT = $b335ada08155d9c0$var$MIN_COLOR.toHexInt();
const $b335ada08155d9c0$var$MAX_COLOR_INT = $b335ada08155d9c0$var$MAX_COLOR.toHexInt();
function $b335ada08155d9c0$export$d52a01683abdfcd6(props) {
    let { value: value, defaultValue: defaultValue, onChange: onChange } = props;
    let { step: step } = $b335ada08155d9c0$var$MIN_COLOR.getChannelRange('red');
    let initialValue = (0, $aa90ad8b2b1d015f$export$5aadd9c0606af5c2)(value);
    let initialDefaultValue = (0, $aa90ad8b2b1d015f$export$5aadd9c0606af5c2)(defaultValue);
    let [colorValue, setColorValue] = (0, $aP5W6$useControlledState)(initialValue, initialDefaultValue, onChange);
    let [inputValue, setInputValue] = (0, $aP5W6$useState)(()=>(value || defaultValue) && colorValue ? colorValue.toString('hex') : '');
    let validation = (0, $aP5W6$useFormValidationState)({
        ...props,
        value: colorValue
    });
    let safelySetColorValue = (newColor)=>{
        if (!colorValue || !newColor) {
            setColorValue(newColor);
            return;
        }
        if (newColor.toHexInt() !== colorValue.toHexInt()) {
            setColorValue(newColor);
            return;
        }
    };
    let [prevValue, setPrevValue] = (0, $aP5W6$useState)(colorValue);
    if (prevValue !== colorValue) {
        setInputValue(colorValue ? colorValue.toString('hex') : '');
        setPrevValue(colorValue);
    }
    let parsedValue = (0, $aP5W6$useMemo)(()=>{
        let color;
        try {
            color = (0, $799cddbef784668f$export$6e865ea70d7724f)(inputValue.startsWith('#') ? inputValue : `#${inputValue}`);
        } catch  {
            color = null;
        }
        return color;
    }, [
        inputValue
    ]);
    let commit = ()=>{
        // Set to empty state if input value is empty
        if (!inputValue.length) {
            safelySetColorValue(null);
            if (value === undefined || colorValue === null) setInputValue('');
            else setInputValue(colorValue.toString('hex'));
            return;
        }
        // if it failed to parse, then reset input to formatted version of current number
        if (parsedValue == null) {
            setInputValue(colorValue ? colorValue.toString('hex') : '');
            return;
        }
        safelySetColorValue(parsedValue);
        // in a controlled state, the numberValue won't change, so we won't go back to our old input without help
        let newColorValue = '';
        if (colorValue) newColorValue = colorValue.toString('hex');
        setInputValue(newColorValue);
    };
    let increment = ()=>{
        let newValue = $b335ada08155d9c0$var$addColorValue(parsedValue, step);
        // if we've arrived at the same value that was previously in the state, the
        // input value should be updated to match
        // ex type 4, press increment, highlight the number in the input, type 4 again, press increment
        // you'd be at 5, then incrementing to 5 again, so no re-render would happen and 4 would be left in the input
        if (newValue === colorValue) setInputValue(newValue.toString('hex'));
        safelySetColorValue(newValue);
        validation.commitValidation();
    };
    let decrement = ()=>{
        let newValue = $b335ada08155d9c0$var$addColorValue(parsedValue, -step);
        // if we've arrived at the same value that was previously in the state, the
        // input value should be updated to match
        // ex type 4, press increment, highlight the number in the input, type 4 again, press increment
        // you'd be at 5, then incrementing to 5 again, so no re-render would happen and 4 would be left in the input
        if (newValue === colorValue) setInputValue(newValue.toString('hex'));
        safelySetColorValue(newValue);
        validation.commitValidation();
    };
    let incrementToMax = ()=>safelySetColorValue($b335ada08155d9c0$var$MAX_COLOR);
    let decrementToMin = ()=>safelySetColorValue($b335ada08155d9c0$var$MIN_COLOR);
    let validate = (value)=>{
        var _value_match;
        return value === '' || !!((_value_match = value.match(/^#?[0-9a-f]{0,6}$/i)) === null || _value_match === void 0 ? void 0 : _value_match[0]);
    };
    return {
        ...validation,
        validate: validate,
        colorValue: colorValue,
        inputValue: inputValue,
        setInputValue: setInputValue,
        commit: commit,
        increment: increment,
        incrementToMax: incrementToMax,
        decrement: decrement,
        decrementToMin: decrementToMin
    };
}
function $b335ada08155d9c0$var$addColorValue(color, step) {
    let newColor = color ? color : $b335ada08155d9c0$var$MIN_COLOR;
    let colorInt = newColor.toHexInt();
    let clampInt = Math.min(Math.max(colorInt + step, $b335ada08155d9c0$var$MIN_COLOR_INT), $b335ada08155d9c0$var$MAX_COLOR_INT);
    if (clampInt !== colorInt) {
        let newColorString = `#${clampInt.toString(16).padStart(6, '0').toUpperCase()}`;
        newColor = (0, $799cddbef784668f$export$6e865ea70d7724f)(newColorString);
    }
    return newColor;
}


export {$b335ada08155d9c0$export$d52a01683abdfcd6 as useColorFieldState};
//# sourceMappingURL=useColorFieldState.module.js.map
