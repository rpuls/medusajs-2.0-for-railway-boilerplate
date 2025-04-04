import {snapValueToStep as $kNCPO$snapValueToStep, clamp as $kNCPO$clamp, useControlledState as $kNCPO$useControlledState} from "@react-stately/utils";
import {useFormValidationState as $kNCPO$useFormValidationState} from "@react-stately/form";
import {NumberFormatter as $kNCPO$NumberFormatter, NumberParser as $kNCPO$NumberParser} from "@internationalized/number";
import {useState as $kNCPO$useState, useMemo as $kNCPO$useMemo, useCallback as $kNCPO$useCallback} from "react";

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



function $de67e98908f0c6ee$export$7f629e9dc1ecf37c(props) {
    let { minValue: minValue, maxValue: maxValue, step: step, formatOptions: formatOptions, value: value, defaultValue: defaultValue = NaN, onChange: onChange, locale: locale, isDisabled: isDisabled, isReadOnly: isReadOnly } = props;
    if (value === null) value = NaN;
    if (value !== undefined && !isNaN(value)) {
        if (step !== undefined && !isNaN(step)) value = (0, $kNCPO$snapValueToStep)(value, minValue, maxValue, step);
        else value = (0, $kNCPO$clamp)(value, minValue, maxValue);
    }
    if (!isNaN(defaultValue)) {
        if (step !== undefined && !isNaN(step)) defaultValue = (0, $kNCPO$snapValueToStep)(defaultValue, minValue, maxValue, step);
        else defaultValue = (0, $kNCPO$clamp)(defaultValue, minValue, maxValue);
    }
    let [numberValue, setNumberValue] = (0, $kNCPO$useControlledState)(value, isNaN(defaultValue) ? NaN : defaultValue, onChange);
    let [inputValue, setInputValue] = (0, $kNCPO$useState)(()=>isNaN(numberValue) ? '' : new (0, $kNCPO$NumberFormatter)(locale, formatOptions).format(numberValue));
    let numberParser = (0, $kNCPO$useMemo)(()=>new (0, $kNCPO$NumberParser)(locale, formatOptions), [
        locale,
        formatOptions
    ]);
    let numberingSystem = (0, $kNCPO$useMemo)(()=>numberParser.getNumberingSystem(inputValue), [
        numberParser,
        inputValue
    ]);
    let formatter = (0, $kNCPO$useMemo)(()=>new (0, $kNCPO$NumberFormatter)(locale, {
            ...formatOptions,
            numberingSystem: numberingSystem
        }), [
        locale,
        formatOptions,
        numberingSystem
    ]);
    let intlOptions = (0, $kNCPO$useMemo)(()=>formatter.resolvedOptions(), [
        formatter
    ]);
    let format = (0, $kNCPO$useCallback)((value)=>isNaN(value) || value === null ? '' : formatter.format(value), [
        formatter
    ]);
    let validation = (0, $kNCPO$useFormValidationState)({
        ...props,
        value: numberValue
    });
    let clampStep = step !== undefined && !isNaN(step) ? step : 1;
    if (intlOptions.style === 'percent' && (step === undefined || isNaN(step))) clampStep = 0.01;
    // Update the input value when the number value or format options change. This is done
    // in a useEffect so that the controlled behavior is correct and we only update the
    // textfield after prop changes.
    let [prevValue, setPrevValue] = (0, $kNCPO$useState)(numberValue);
    let [prevLocale, setPrevLocale] = (0, $kNCPO$useState)(locale);
    let [prevFormatOptions, setPrevFormatOptions] = (0, $kNCPO$useState)(formatOptions);
    if (!Object.is(numberValue, prevValue) || locale !== prevLocale || formatOptions !== prevFormatOptions) {
        setInputValue(format(numberValue));
        setPrevValue(numberValue);
        setPrevLocale(locale);
        setPrevFormatOptions(formatOptions);
    }
    let parsedValue = (0, $kNCPO$useMemo)(()=>numberParser.parse(inputValue), [
        numberParser,
        inputValue
    ]);
    let commit = ()=>{
        // Set to empty state if input value is empty
        if (!inputValue.length) {
            setNumberValue(NaN);
            setInputValue(value === undefined ? '' : format(numberValue));
            return;
        }
        // if it failed to parse, then reset input to formatted version of current number
        if (isNaN(parsedValue)) {
            setInputValue(format(numberValue));
            return;
        }
        // Clamp to min and max, round to the nearest step, and round to specified number of digits
        let clampedValue;
        if (step === undefined || isNaN(step)) clampedValue = (0, $kNCPO$clamp)(parsedValue, minValue, maxValue);
        else clampedValue = (0, $kNCPO$snapValueToStep)(parsedValue, minValue, maxValue, step);
        clampedValue = numberParser.parse(format(clampedValue));
        setNumberValue(clampedValue);
        // in a controlled state, the numberValue won't change, so we won't go back to our old input without help
        setInputValue(format(value === undefined ? clampedValue : numberValue));
    };
    let safeNextStep = (operation, minMax = 0)=>{
        let prev = parsedValue;
        if (isNaN(prev)) {
            // if the input is empty, start from the min/max value when incrementing/decrementing,
            // or zero if there is no min/max value defined.
            let newValue = isNaN(minMax) ? 0 : minMax;
            return (0, $kNCPO$snapValueToStep)(newValue, minValue, maxValue, clampStep);
        } else {
            // otherwise, first snap the current value to the nearest step. if it moves in the direction
            // we're going, use that value, otherwise add the step and snap that value.
            let newValue = (0, $kNCPO$snapValueToStep)(prev, minValue, maxValue, clampStep);
            if (operation === '+' && newValue > prev || operation === '-' && newValue < prev) return newValue;
            return (0, $kNCPO$snapValueToStep)($de67e98908f0c6ee$var$handleDecimalOperation(operation, prev, clampStep), minValue, maxValue, clampStep);
        }
    };
    let increment = ()=>{
        let newValue = safeNextStep('+', minValue);
        // if we've arrived at the same value that was previously in the state, the
        // input value should be updated to match
        // ex type 4, press increment, highlight the number in the input, type 4 again, press increment
        // you'd be at 5, then incrementing to 5 again, so no re-render would happen and 4 would be left in the input
        if (newValue === numberValue) setInputValue(format(newValue));
        setNumberValue(newValue);
        validation.commitValidation();
    };
    let decrement = ()=>{
        let newValue = safeNextStep('-', maxValue);
        if (newValue === numberValue) setInputValue(format(newValue));
        setNumberValue(newValue);
        validation.commitValidation();
    };
    let incrementToMax = ()=>{
        if (maxValue != null) {
            setNumberValue((0, $kNCPO$snapValueToStep)(maxValue, minValue, maxValue, clampStep));
            validation.commitValidation();
        }
    };
    let decrementToMin = ()=>{
        if (minValue != null) {
            setNumberValue(minValue);
            validation.commitValidation();
        }
    };
    let canIncrement = (0, $kNCPO$useMemo)(()=>!isDisabled && !isReadOnly && (isNaN(parsedValue) || maxValue === undefined || isNaN(maxValue) || (0, $kNCPO$snapValueToStep)(parsedValue, minValue, maxValue, clampStep) > parsedValue || $de67e98908f0c6ee$var$handleDecimalOperation('+', parsedValue, clampStep) <= maxValue), [
        isDisabled,
        isReadOnly,
        minValue,
        maxValue,
        clampStep,
        parsedValue
    ]);
    let canDecrement = (0, $kNCPO$useMemo)(()=>!isDisabled && !isReadOnly && (isNaN(parsedValue) || minValue === undefined || isNaN(minValue) || (0, $kNCPO$snapValueToStep)(parsedValue, minValue, maxValue, clampStep) < parsedValue || $de67e98908f0c6ee$var$handleDecimalOperation('-', parsedValue, clampStep) >= minValue), [
        isDisabled,
        isReadOnly,
        minValue,
        maxValue,
        clampStep,
        parsedValue
    ]);
    let validate = (value)=>numberParser.isValidPartialNumber(value, minValue, maxValue);
    return {
        ...validation,
        validate: validate,
        increment: increment,
        incrementToMax: incrementToMax,
        decrement: decrement,
        decrementToMin: decrementToMin,
        canIncrement: canIncrement,
        canDecrement: canDecrement,
        minValue: minValue,
        maxValue: maxValue,
        numberValue: parsedValue,
        setNumberValue: setNumberValue,
        setInputValue: setInputValue,
        inputValue: inputValue,
        commit: commit
    };
}
function $de67e98908f0c6ee$var$handleDecimalOperation(operator, value1, value2) {
    let result = operator === '+' ? value1 + value2 : value1 - value2;
    // Check if we have decimals
    if (value1 % 1 !== 0 || value2 % 1 !== 0) {
        const value1Decimal = value1.toString().split('.');
        const value2Decimal = value2.toString().split('.');
        const value1DecimalLength = value1Decimal[1] && value1Decimal[1].length || 0;
        const value2DecimalLength = value2Decimal[1] && value2Decimal[1].length || 0;
        const multiplier = Math.pow(10, Math.max(value1DecimalLength, value2DecimalLength));
        // Transform the decimals to integers based on the precision
        value1 = Math.round(value1 * multiplier);
        value2 = Math.round(value2 * multiplier);
        // Perform the operation on integers values to make sure we don't get a fancy decimal value
        result = operator === '+' ? value1 + value2 : value1 - value2;
        // Transform the integer result back to decimal
        result /= multiplier;
    }
    return result;
}


export {$de67e98908f0c6ee$export$7f629e9dc1ecf37c as useNumberFieldState};
//# sourceMappingURL=useNumberFieldState.module.js.map
