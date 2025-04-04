var $4932e21065cdc2cd$exports = require("./intlStrings.main.js");
var $9WaOX$reactariautils = require("@react-aria/utils");
var $9WaOX$react = require("react");
var $9WaOX$reactstatelyform = require("@react-stately/form");
var $9WaOX$reactariainteractions = require("@react-aria/interactions");
var $9WaOX$reactariatextfield = require("@react-aria/textfield");
var $9WaOX$reactariai18n = require("@react-aria/i18n");
var $9WaOX$reactariaspinbutton = require("@react-aria/spinbutton");


function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}

function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "useNumberField", () => $fa863e9b015ae839$export$23f548e970bdf099);
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







function $fa863e9b015ae839$export$23f548e970bdf099(props, state, inputRef) {
    let { id: id, decrementAriaLabel: decrementAriaLabel, incrementAriaLabel: incrementAriaLabel, isDisabled: isDisabled, isReadOnly: isReadOnly, isRequired: isRequired, minValue: minValue, maxValue: maxValue, autoFocus: autoFocus, label: label, formatOptions: formatOptions, onBlur: onBlur = ()=>{}, onFocus: onFocus, onFocusChange: onFocusChange, onKeyDown: onKeyDown, onKeyUp: onKeyUp, description: description, errorMessage: errorMessage, isWheelDisabled: isWheelDisabled, ...otherProps } = props;
    let { increment: increment, incrementToMax: incrementToMax, decrement: decrement, decrementToMin: decrementToMin, numberValue: numberValue, inputValue: inputValue, commit: commit, commitValidation: commitValidation } = state;
    const stringFormatter = (0, $9WaOX$reactariai18n.useLocalizedStringFormatter)((0, ($parcel$interopDefault($4932e21065cdc2cd$exports))), '@react-aria/numberfield');
    let inputId = (0, $9WaOX$reactariautils.useId)(id);
    let { focusProps: focusProps } = (0, $9WaOX$reactariainteractions.useFocus)({
        onBlur () {
            // Set input value to normalized valid value
            commit();
        }
    });
    let numberFormatter = (0, $9WaOX$reactariai18n.useNumberFormatter)(formatOptions);
    let intlOptions = (0, $9WaOX$react.useMemo)(()=>numberFormatter.resolvedOptions(), [
        numberFormatter
    ]);
    // Replace negative textValue formatted using currencySign: 'accounting'
    // with a textValue that can be announced using a minus sign.
    let textValueFormatter = (0, $9WaOX$reactariai18n.useNumberFormatter)({
        ...formatOptions,
        currencySign: undefined
    });
    let textValue = (0, $9WaOX$react.useMemo)(()=>isNaN(numberValue) ? '' : textValueFormatter.format(numberValue), [
        textValueFormatter,
        numberValue
    ]);
    let { spinButtonProps: spinButtonProps, incrementButtonProps: incButtonProps, decrementButtonProps: decButtonProps } = (0, $9WaOX$reactariaspinbutton.useSpinButton)({
        isDisabled: isDisabled,
        isReadOnly: isReadOnly,
        isRequired: isRequired,
        maxValue: maxValue,
        minValue: minValue,
        onIncrement: increment,
        onIncrementToMax: incrementToMax,
        onDecrement: decrement,
        onDecrementToMin: decrementToMin,
        value: numberValue,
        textValue: textValue
    });
    let [focusWithin, setFocusWithin] = (0, $9WaOX$react.useState)(false);
    let { focusWithinProps: focusWithinProps } = (0, $9WaOX$reactariainteractions.useFocusWithin)({
        isDisabled: isDisabled,
        onFocusWithinChange: setFocusWithin
    });
    let onWheel = (0, $9WaOX$react.useCallback)((e)=>{
        // if on a trackpad, users can scroll in both X and Y at once, check the magnitude of the change
        // if it's mostly in the X direction, then just return, the user probably doesn't mean to inc/dec
        // this isn't perfect, events come in fast with small deltas and a part of the scroll may give a false indication
        // especially if the user is scrolling near 45deg
        if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
        if (e.deltaY > 0) increment();
        else if (e.deltaY < 0) decrement();
    }, [
        decrement,
        increment
    ]);
    // If the input isn't supposed to receive input, disable scrolling.
    let scrollingDisabled = isWheelDisabled || isDisabled || isReadOnly || !focusWithin;
    (0, $9WaOX$reactariainteractions.useScrollWheel)({
        onScroll: onWheel,
        isDisabled: scrollingDisabled
    }, inputRef);
    var _intlOptions_maximumFractionDigits;
    // The inputMode attribute influences the software keyboard that is shown on touch devices.
    // Browsers and operating systems are quite inconsistent about what keys are available, however.
    // We choose between numeric and decimal based on whether we allow negative and fractional numbers,
    // and based on testing on various devices to determine what keys are available in each inputMode.
    let hasDecimals = ((_intlOptions_maximumFractionDigits = intlOptions.maximumFractionDigits) !== null && _intlOptions_maximumFractionDigits !== void 0 ? _intlOptions_maximumFractionDigits : 0) > 0;
    let hasNegative = state.minValue === undefined || isNaN(state.minValue) || state.minValue < 0;
    let inputMode = 'numeric';
    if ((0, $9WaOX$reactariautils.isIPhone)()) {
        // iPhone doesn't have a minus sign in either numeric or decimal.
        // Note this is only for iPhone, not iPad, which always has both
        // minus and decimal in numeric.
        if (hasNegative) inputMode = 'text';
        else if (hasDecimals) inputMode = 'decimal';
    } else if ((0, $9WaOX$reactariautils.isAndroid)()) {
        // Android numeric has both a decimal point and minus key.
        // decimal does not have a minus key.
        if (hasNegative) inputMode = 'numeric';
        else if (hasDecimals) inputMode = 'decimal';
    }
    let onChange = (value)=>{
        if (state.validate(value)) state.setInputValue(value);
    };
    let domProps = (0, $9WaOX$reactariautils.filterDOMProps)(props);
    let onKeyDownEnter = (0, $9WaOX$react.useCallback)((e)=>{
        if (e.key === 'Enter') {
            commit();
            commitValidation();
        } else e.continuePropagation();
    }, [
        commit,
        commitValidation
    ]);
    let { isInvalid: isInvalid, validationErrors: validationErrors, validationDetails: validationDetails } = state.displayValidation;
    let { labelProps: labelProps, inputProps: textFieldProps, descriptionProps: descriptionProps, errorMessageProps: errorMessageProps } = (0, $9WaOX$reactariatextfield.useFormattedTextField)({
        ...otherProps,
        ...domProps,
        name: undefined,
        label: label,
        autoFocus: autoFocus,
        isDisabled: isDisabled,
        isReadOnly: isReadOnly,
        isRequired: isRequired,
        validate: undefined,
        [(0, $9WaOX$reactstatelyform.privateValidationStateProp)]: state,
        value: inputValue,
        defaultValue: undefined,
        autoComplete: 'off',
        'aria-label': props['aria-label'] || undefined,
        'aria-labelledby': props['aria-labelledby'] || undefined,
        id: inputId,
        type: 'text',
        inputMode: inputMode,
        onChange: onChange,
        onBlur: onBlur,
        onFocus: onFocus,
        onFocusChange: onFocusChange,
        onKeyDown: (0, $9WaOX$react.useMemo)(()=>(0, $9WaOX$reactariautils.chain)(onKeyDownEnter, onKeyDown), [
            onKeyDownEnter,
            onKeyDown
        ]),
        onKeyUp: onKeyUp,
        description: description,
        errorMessage: errorMessage
    }, state, inputRef);
    (0, $9WaOX$reactariautils.useFormReset)(inputRef, state.numberValue, state.setNumberValue);
    let inputProps = (0, $9WaOX$reactariautils.mergeProps)(spinButtonProps, focusProps, textFieldProps, {
        // override the spinbutton role, we can't focus a spin button with VO
        role: null,
        // ignore aria-roledescription on iOS so that required state will announce when it is present
        'aria-roledescription': !(0, $9WaOX$reactariautils.isIOS)() ? stringFormatter.format('numberField') : null,
        'aria-valuemax': null,
        'aria-valuemin': null,
        'aria-valuenow': null,
        'aria-valuetext': null,
        autoCorrect: 'off',
        spellCheck: 'false'
    });
    if (props.validationBehavior === 'native') inputProps['aria-required'] = undefined;
    let onButtonPressStart = (e)=>{
        var _inputRef_current;
        // If focus is already on the input, keep it there so we don't hide the
        // software keyboard when tapping the increment/decrement buttons.
        if (document.activeElement === inputRef.current) return;
        // Otherwise, when using a mouse, move focus to the input.
        // On touch, or with a screen reader, focus the button so that the software
        // keyboard does not appear and the screen reader cursor is not moved off the button.
        if (e.pointerType === 'mouse') (_inputRef_current = inputRef.current) === null || _inputRef_current === void 0 ? void 0 : _inputRef_current.focus();
        else e.target.focus();
    };
    // Determine the label for the increment and decrement buttons. There are 4 cases:
    //
    // 1. With a visible label that is a string: aria-label: `Increase ${props.label}`
    // 2. With a visible label that is JSX: aria-label: 'Increase', aria-labelledby: '${incrementId} ${labelId}'
    // 3. With an aria-label: aria-label: `Increase ${props['aria-label']}`
    // 4. With an aria-labelledby: aria-label: 'Increase', aria-labelledby: `${incrementId} ${props['aria-labelledby']}`
    //
    // (1) and (2) could possibly be combined and both use aria-labelledby. However, placing the label in
    // the aria-label string rather than using aria-labelledby gives more flexibility to translators to change
    // the order or add additional words around the label if needed.
    let fieldLabel = props['aria-label'] || (typeof props.label === 'string' ? props.label : '');
    let ariaLabelledby;
    if (!fieldLabel) ariaLabelledby = props.label != null ? labelProps.id : props['aria-labelledby'];
    let incrementId = (0, $9WaOX$reactariautils.useId)();
    let decrementId = (0, $9WaOX$reactariautils.useId)();
    let incrementButtonProps = (0, $9WaOX$reactariautils.mergeProps)(incButtonProps, {
        'aria-label': incrementAriaLabel || stringFormatter.format('increase', {
            fieldLabel: fieldLabel
        }).trim(),
        id: ariaLabelledby && !incrementAriaLabel ? incrementId : null,
        'aria-labelledby': ariaLabelledby && !incrementAriaLabel ? `${incrementId} ${ariaLabelledby}` : null,
        'aria-controls': inputId,
        excludeFromTabOrder: true,
        preventFocusOnPress: true,
        allowFocusWhenDisabled: true,
        isDisabled: !state.canIncrement,
        onPressStart: onButtonPressStart
    });
    let decrementButtonProps = (0, $9WaOX$reactariautils.mergeProps)(decButtonProps, {
        'aria-label': decrementAriaLabel || stringFormatter.format('decrease', {
            fieldLabel: fieldLabel
        }).trim(),
        id: ariaLabelledby && !decrementAriaLabel ? decrementId : null,
        'aria-labelledby': ariaLabelledby && !decrementAriaLabel ? `${decrementId} ${ariaLabelledby}` : null,
        'aria-controls': inputId,
        excludeFromTabOrder: true,
        preventFocusOnPress: true,
        allowFocusWhenDisabled: true,
        isDisabled: !state.canDecrement,
        onPressStart: onButtonPressStart
    });
    return {
        groupProps: {
            ...focusWithinProps,
            role: 'group',
            'aria-disabled': isDisabled,
            'aria-invalid': isInvalid ? 'true' : undefined
        },
        labelProps: labelProps,
        inputProps: inputProps,
        incrementButtonProps: incrementButtonProps,
        decrementButtonProps: decrementButtonProps,
        errorMessageProps: errorMessageProps,
        descriptionProps: descriptionProps,
        isInvalid: isInvalid,
        validationErrors: validationErrors,
        validationDetails: validationDetails
    };
}


//# sourceMappingURL=useNumberField.main.js.map
