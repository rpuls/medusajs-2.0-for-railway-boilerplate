import {snapValueToStep as $BT4Uh$snapValueToStep, useControlledState as $BT4Uh$useControlledState, clamp as $BT4Uh$clamp} from "@react-stately/utils";
import {useMemo as $BT4Uh$useMemo, useCallback as $BT4Uh$useCallback, useState as $BT4Uh$useState, useRef as $BT4Uh$useRef} from "react";

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

const $28f99e3e86e6ec45$var$DEFAULT_MIN_VALUE = 0;
const $28f99e3e86e6ec45$var$DEFAULT_MAX_VALUE = 100;
const $28f99e3e86e6ec45$var$DEFAULT_STEP_VALUE = 1;
function $28f99e3e86e6ec45$export$e5fda3247f5d67f9(props) {
    const { isDisabled: isDisabled = false, minValue: minValue = $28f99e3e86e6ec45$var$DEFAULT_MIN_VALUE, maxValue: maxValue = $28f99e3e86e6ec45$var$DEFAULT_MAX_VALUE, numberFormatter: formatter, step: step = $28f99e3e86e6ec45$var$DEFAULT_STEP_VALUE, orientation: orientation = 'horizontal' } = props;
    // Page step should be at least equal to step and always a multiple of the step.
    let pageSize = (0, $BT4Uh$useMemo)(()=>{
        let calcPageSize = (maxValue - minValue) / 10;
        calcPageSize = (0, $BT4Uh$snapValueToStep)(calcPageSize, 0, calcPageSize + step, step);
        return Math.max(calcPageSize, step);
    }, [
        step,
        maxValue,
        minValue
    ]);
    let restrictValues = (0, $BT4Uh$useCallback)((values)=>values === null || values === void 0 ? void 0 : values.map((val, idx)=>{
            let min = idx === 0 ? minValue : values[idx - 1];
            let max = idx === values.length - 1 ? maxValue : values[idx + 1];
            return (0, $BT4Uh$snapValueToStep)(val, min, max, step);
        }), [
        minValue,
        maxValue,
        step
    ]);
    let value = (0, $BT4Uh$useMemo)(()=>restrictValues($28f99e3e86e6ec45$var$convertValue(props.value)), [
        props.value
    ]);
    let defaultValue = (0, $BT4Uh$useMemo)(()=>{
        var _convertValue;
        return restrictValues((_convertValue = $28f99e3e86e6ec45$var$convertValue(props.defaultValue)) !== null && _convertValue !== void 0 ? _convertValue : [
            minValue
        ]);
    }, [
        props.defaultValue,
        minValue
    ]);
    let onChange = $28f99e3e86e6ec45$var$createOnChange(props.value, props.defaultValue, props.onChange);
    let onChangeEnd = $28f99e3e86e6ec45$var$createOnChange(props.value, props.defaultValue, props.onChangeEnd);
    const [values, setValuesState] = (0, $BT4Uh$useControlledState)(value, defaultValue, onChange);
    const [isDraggings, setDraggingsState] = (0, $BT4Uh$useState)(new Array(values.length).fill(false));
    const isEditablesRef = (0, $BT4Uh$useRef)(new Array(values.length).fill(true));
    const [focusedIndex, setFocusedIndex] = (0, $BT4Uh$useState)(undefined);
    const valuesRef = (0, $BT4Uh$useRef)(values);
    const isDraggingsRef = (0, $BT4Uh$useRef)(isDraggings);
    let setValues = (values)=>{
        valuesRef.current = values;
        setValuesState(values);
    };
    let setDraggings = (draggings)=>{
        isDraggingsRef.current = draggings;
        setDraggingsState(draggings);
    };
    function getValuePercent(value) {
        return (value - minValue) / (maxValue - minValue);
    }
    function getThumbMinValue(index) {
        return index === 0 ? minValue : values[index - 1];
    }
    function getThumbMaxValue(index) {
        return index === values.length - 1 ? maxValue : values[index + 1];
    }
    function isThumbEditable(index) {
        return isEditablesRef.current[index];
    }
    function setThumbEditable(index, editable) {
        isEditablesRef.current[index] = editable;
    }
    function updateValue(index, value) {
        if (isDisabled || !isThumbEditable(index)) return;
        const thisMin = getThumbMinValue(index);
        const thisMax = getThumbMaxValue(index);
        // Round value to multiple of step, clamp value between min and max
        value = (0, $BT4Uh$snapValueToStep)(value, thisMin, thisMax, step);
        let newValues = $28f99e3e86e6ec45$var$replaceIndex(valuesRef.current, index, value);
        setValues(newValues);
    }
    function updateDragging(index, dragging) {
        if (isDisabled || !isThumbEditable(index)) return;
        if (dragging) valuesRef.current = values;
        const wasDragging = isDraggingsRef.current[index];
        isDraggingsRef.current = $28f99e3e86e6ec45$var$replaceIndex(isDraggingsRef.current, index, dragging);
        setDraggings(isDraggingsRef.current);
        // Call onChangeEnd if no handles are dragging.
        if (onChangeEnd && wasDragging && !isDraggingsRef.current.some(Boolean)) onChangeEnd(valuesRef.current);
    }
    function getFormattedValue(value) {
        return formatter.format(value);
    }
    function setThumbPercent(index, percent) {
        updateValue(index, getPercentValue(percent));
    }
    function getRoundedValue(value) {
        return Math.round((value - minValue) / step) * step + minValue;
    }
    function getPercentValue(percent) {
        const val = percent * (maxValue - minValue) + minValue;
        return (0, $BT4Uh$clamp)(getRoundedValue(val), minValue, maxValue);
    }
    function incrementThumb(index, stepSize = 1) {
        let s = Math.max(stepSize, step);
        updateValue(index, (0, $BT4Uh$snapValueToStep)(values[index] + s, minValue, maxValue, step));
    }
    function decrementThumb(index, stepSize = 1) {
        let s = Math.max(stepSize, step);
        updateValue(index, (0, $BT4Uh$snapValueToStep)(values[index] - s, minValue, maxValue, step));
    }
    return {
        values: values,
        getThumbValue: (index)=>values[index],
        setThumbValue: updateValue,
        setThumbPercent: setThumbPercent,
        isThumbDragging: (index)=>isDraggings[index],
        setThumbDragging: updateDragging,
        focusedThumb: focusedIndex,
        setFocusedThumb: setFocusedIndex,
        getThumbPercent: (index)=>getValuePercent(values[index]),
        getValuePercent: getValuePercent,
        getThumbValueLabel: (index)=>getFormattedValue(values[index]),
        getFormattedValue: getFormattedValue,
        getThumbMinValue: getThumbMinValue,
        getThumbMaxValue: getThumbMaxValue,
        getPercentValue: getPercentValue,
        isThumbEditable: isThumbEditable,
        setThumbEditable: setThumbEditable,
        incrementThumb: incrementThumb,
        decrementThumb: decrementThumb,
        step: step,
        pageSize: pageSize,
        orientation: orientation,
        isDisabled: isDisabled
    };
}
function $28f99e3e86e6ec45$var$replaceIndex(array, index, value) {
    if (array[index] === value) return array;
    return [
        ...array.slice(0, index),
        value,
        ...array.slice(index + 1)
    ];
}
function $28f99e3e86e6ec45$var$convertValue(value) {
    if (value == null) return undefined;
    return Array.isArray(value) ? value : [
        value
    ];
}
function $28f99e3e86e6ec45$var$createOnChange(value, defaultValue, onChange) {
    return (newValue)=>{
        if (typeof value === 'number' || typeof defaultValue === 'number') onChange === null || onChange === void 0 ? void 0 : onChange(newValue[0]);
        else onChange === null || onChange === void 0 ? void 0 : onChange(newValue);
    };
}


export {$28f99e3e86e6ec45$export$e5fda3247f5d67f9 as useSliderState};
//# sourceMappingURL=useSliderState.module.js.map
