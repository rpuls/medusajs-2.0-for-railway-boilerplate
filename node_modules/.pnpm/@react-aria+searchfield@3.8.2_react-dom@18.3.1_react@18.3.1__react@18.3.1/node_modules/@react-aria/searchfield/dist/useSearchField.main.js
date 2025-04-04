var $8e80a08ea739bb00$exports = require("./intlStrings.main.js");
var $2KtRb$reactariautils = require("@react-aria/utils");
var $2KtRb$reactariai18n = require("@react-aria/i18n");
var $2KtRb$reactariatextfield = require("@react-aria/textfield");


function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}

function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "useSearchField", () => $ccae92a71d96d51a$export$9bb30bbe003b82e0);
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



function $ccae92a71d96d51a$export$9bb30bbe003b82e0(props, state, inputRef) {
    let stringFormatter = (0, $2KtRb$reactariai18n.useLocalizedStringFormatter)((0, ($parcel$interopDefault($8e80a08ea739bb00$exports))), '@react-aria/searchfield');
    let { isDisabled: isDisabled, isReadOnly: isReadOnly, onSubmit: onSubmit, onClear: onClear, type: type = 'search' } = props;
    let onKeyDown = (e)=>{
        const key = e.key;
        if (key === 'Enter' && (isDisabled || isReadOnly)) e.preventDefault();
        if (isDisabled || isReadOnly) return;
        // for backward compatibility;
        // otherwise, "Enter" on an input would trigger a form submit, the default browser behavior
        if (key === 'Enter' && onSubmit) {
            e.preventDefault();
            onSubmit(state.value);
        }
        if (key === 'Escape') {
            // Also check the inputRef value for the case where the value was set directly on the input element instead of going through
            // the hook
            if (state.value === '' && (!inputRef.current || inputRef.current.value === '')) e.continuePropagation();
            else {
                e.preventDefault();
                state.setValue('');
                if (onClear) onClear();
            }
        }
    };
    let onClearButtonClick = ()=>{
        state.setValue('');
        if (onClear) onClear();
    };
    let onPressStart = ()=>{
        var // this is in PressStart for mobile so that touching the clear button doesn't remove focus from
        // the input and close the keyboard
        _inputRef_current;
        (_inputRef_current = inputRef.current) === null || _inputRef_current === void 0 ? void 0 : _inputRef_current.focus();
    };
    let { labelProps: labelProps, inputProps: inputProps, descriptionProps: descriptionProps, errorMessageProps: errorMessageProps, ...validation } = (0, $2KtRb$reactariatextfield.useTextField)({
        ...props,
        value: state.value,
        onChange: state.setValue,
        onKeyDown: !isReadOnly ? (0, $2KtRb$reactariautils.chain)(onKeyDown, props.onKeyDown) : props.onKeyDown,
        type: type
    }, inputRef);
    return {
        labelProps: labelProps,
        inputProps: {
            ...inputProps,
            // already handled by useSearchFieldState
            defaultValue: undefined
        },
        clearButtonProps: {
            'aria-label': stringFormatter.format('Clear search'),
            excludeFromTabOrder: true,
            preventFocusOnPress: true,
            isDisabled: isDisabled || isReadOnly,
            onPress: onClearButtonClick,
            onPressStart: onPressStart
        },
        descriptionProps: descriptionProps,
        errorMessageProps: errorMessageProps,
        ...validation
    };
}


//# sourceMappingURL=useSearchField.main.js.map
