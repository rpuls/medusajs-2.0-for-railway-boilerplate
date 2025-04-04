var $1NNdE$reactstatelyutils = require("@react-stately/utils");
var $1NNdE$react = require("react");


function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "useSliderState", () => $e86753598efd0f02$export$e5fda3247f5d67f9);
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

const $e86753598efd0f02$var$DEFAULT_MIN_VALUE = 0;
const $e86753598efd0f02$var$DEFAULT_MAX_VALUE = 100;
const $e86753598efd0f02$var$DEFAULT_STEP_VALUE = 1;
function $e86753598efd0f02$export$e5fda3247f5d67f9(props) {
    const { isDisabled: isDisabled = false, minValue: minValue = $e86753598efd0f02$var$DEFAULT_MIN_VALUE, maxValue: maxValue = $e86753598efd0f02$var$DEFAULT_MAX_VALUE, numberFormatter: formatter, step: step = $e86753598efd0f02$var$DEFAULT_STEP_VALUE, orientation: orientation = 'horizontal' } = props;
    // Page step should be at least equal to step and always a multiple of the step.
    let pageSize = (0, $1NNdE$react.useMemo)(()=>{
        let calcPageSize = (maxValue - minValue) / 10;
        calcPageSize = (0, $1NNdE$reactstatelyutils.snapValueToStep)(calcPageSize, 0, calcPageSize + step, step);
        return Math.max(calcPageSize, step);
    }, [
        step,
        maxValue,
        minValue
    ]);
    let restrictValues = (0, $1NNdE$react.useCallback)((values)=>values === null || values === void 0 ? void 0 : values.map((val, idx)=>{
            let min = idx === 0 ? minValue : values[idx - 1];
            let max = idx === values.length - 1 ? maxValue : values[idx + 1];
            return (0, $1NNdE$reactstatelyutils.snapValueToStep)(val, min, max, step);
        }), [
        minValue,
        maxValue,
        step
    ]);
    let value = (0, $1NNdE$react.useMemo)(()=>restrictValues($e86753598efd0f02$var$convertValue(props.value)), [
        props.value
    ]);
    let defaultValue = (0, $1NNdE$react.useMemo)(()=>{
        var _convertValue;
        return restrictValues((_convertValue = $e86753598efd0f02$var$convertValue(props.defaultValue)) !== null && _convertValue !== void 0 ? _convertValue : [
            minValue
        ]);
    }, [
        props.defaultValue,
        minValue
    ]);
    let onChange = $e86753598efd0f02$var$createOnChange(props.value, props.defaultValue, props.onChange);
    let onChangeEnd = $e86753598efd0f02$var$createOnChange(props.value, props.defaultValue, props.onChangeEnd);
    const [values, setValuesState] = (0, $1NNdE$reactstatelyutils.useControlledState)(value, defaultValue, onChange);
    const [isDraggings, setDraggingsState] = (0, $1NNdE$react.useState)(new Array(values.length).fill(false));
    const isEditablesRef = (0, $1NNdE$react.useRef)(new Array(values.length).fill(true));
    const [focusedIndex, setFocusedIndex] = (0, $1NNdE$react.useState)(undefined);
    const valuesRef = (0, $1NNdE$react.useRef)(values);
    const isDraggingsRef = (0, $1NNdE$react.useRef)(isDraggings);
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
        value = (0, $1NNdE$reactstatelyutils.snapValueToStep)(value, thisMin, thisMax, step);
        let newValues = $e86753598efd0f02$var$replaceIndex(valuesRef.current, index, value);
        setValues(newValues);
    }
    function updateDragging(index, dragging) {
        if (isDisabled || !isThumbEditable(index)) return;
        if (dragging) valuesRef.current = values;
        const wasDragging = isDraggingsRef.current[index];
        isDraggingsRef.current = $e86753598efd0f02$var$replaceIndex(isDraggingsRef.current, index, dragging);
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
        return (0, $1NNdE$reactstatelyutils.clamp)(getRoundedValue(val), minValue, maxValue);
    }
    function incrementThumb(index, stepSize = 1) {
        let s = Math.max(stepSize, step);
        updateValue(index, (0, $1NNdE$reactstatelyutils.snapValueToStep)(values[index] + s, minValue, maxValue, step));
    }
    function decrementThumb(index, stepSize = 1) {
        let s = Math.max(stepSize, step);
        updateValue(index, (0, $1NNdE$reactstatelyutils.snapValueToStep)(values[index] - s, minValue, maxValue, step));
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
function $e86753598efd0f02$var$replaceIndex(array, index, value) {
    if (array[index] === value) return array;
    return [
        ...array.slice(0, index),
        value,
        ...array.slice(index + 1)
    ];
}
function $e86753598efd0f02$var$convertValue(value) {
    if (value == null) return undefined;
    return Array.isArray(value) ? value : [
        value
    ];
}
function $e86753598efd0f02$var$createOnChange(value, defaultValue, onChange) {
    return (newValue)=>{
        if (typeof value === 'number' || typeof defaultValue === 'number') onChange === null || onChange === void 0 ? void 0 : onChange(newValue[0]);
        else onChange === null || onChange === void 0 ? void 0 : onChange(newValue);
    };
}


//# sourceMappingURL=useSliderState.main.js.map
