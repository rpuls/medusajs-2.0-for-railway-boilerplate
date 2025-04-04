var $grujV$react = require("react");
var $grujV$reactariautils = require("@react-aria/utils");
var $grujV$reactstatelyform = require("@react-stately/form");
var $grujV$reactariainteractions = require("@react-aria/interactions");
var $grujV$reactariatextfield = require("@react-aria/textfield");
var $grujV$reactariaspinbutton = require("@react-aria/spinbutton");


function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "useColorField", () => $58c850037bc7a7ce$export$77e32ca575a28fdf);
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





function $58c850037bc7a7ce$export$77e32ca575a28fdf(props, state, ref) {
    let { isDisabled: isDisabled, isReadOnly: isReadOnly, isRequired: isRequired, isWheelDisabled: isWheelDisabled, validationBehavior: validationBehavior = 'aria' } = props;
    let { colorValue: colorValue, inputValue: inputValue, increment: increment, decrement: decrement, incrementToMax: incrementToMax, decrementToMin: decrementToMin, commit: commit } = state;
    let inputId = (0, $grujV$reactariautils.useId)();
    let { spinButtonProps: spinButtonProps } = (0, $grujV$reactariaspinbutton.useSpinButton)({
        isDisabled: isDisabled,
        isReadOnly: isReadOnly,
        isRequired: isRequired,
        maxValue: 0xFFFFFF,
        minValue: 0,
        onIncrement: increment,
        onIncrementToMax: incrementToMax,
        onDecrement: decrement,
        onDecrementToMin: decrementToMin,
        value: colorValue ? colorValue.toHexInt() : undefined,
        textValue: colorValue ? colorValue.toString('hex') : undefined
    });
    let [focusWithin, setFocusWithin] = (0, $grujV$react.useState)(false);
    let { focusWithinProps: focusWithinProps } = (0, $grujV$reactariainteractions.useFocusWithin)({
        isDisabled: isDisabled,
        onFocusWithinChange: setFocusWithin
    });
    let onWheel = (0, $grujV$react.useCallback)((e)=>{
        if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
        if (e.deltaY > 0) increment();
        else if (e.deltaY < 0) decrement();
    }, [
        decrement,
        increment
    ]);
    // If the input isn't supposed to receive input, disable scrolling.
    let scrollingDisabled = isWheelDisabled || isDisabled || isReadOnly || !focusWithin;
    (0, $grujV$reactariainteractions.useScrollWheel)({
        onScroll: onWheel,
        isDisabled: scrollingDisabled
    }, ref);
    let onChange = (value)=>{
        if (state.validate(value)) state.setInputValue(value);
    };
    let { inputProps: inputProps, ...otherProps } = (0, $grujV$reactariatextfield.useFormattedTextField)({
        ...props,
        id: inputId,
        value: inputValue,
        defaultValue: undefined,
        validate: undefined,
        [(0, $grujV$reactstatelyform.privateValidationStateProp)]: state,
        type: 'text',
        autoComplete: 'off',
        onChange: onChange
    }, state, ref);
    inputProps = (0, $grujV$reactariautils.mergeProps)(inputProps, spinButtonProps, focusWithinProps, {
        role: 'textbox',
        'aria-valuemax': null,
        'aria-valuemin': null,
        'aria-valuenow': null,
        'aria-valuetext': null,
        autoCorrect: 'off',
        spellCheck: 'false',
        onBlur: commit
    });
    if (validationBehavior === 'native') inputProps['aria-required'] = undefined;
    return {
        inputProps: inputProps,
        ...otherProps
    };
}


//# sourceMappingURL=useColorField.main.js.map
