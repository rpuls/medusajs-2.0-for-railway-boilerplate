import {radioGroupData as $884aeceb3d67f00f$export$37b65e5b5444d35c} from "./utils.module.js";
import {filterDOMProps as $czmJy$filterDOMProps, useId as $czmJy$useId, mergeProps as $czmJy$mergeProps} from "@react-aria/utils";
import {getFocusableTreeWalker as $czmJy$getFocusableTreeWalker} from "@react-aria/focus";
import {useField as $czmJy$useField} from "@react-aria/label";
import {useFocusWithin as $czmJy$useFocusWithin} from "@react-aria/interactions";
import {useLocale as $czmJy$useLocale} from "@react-aria/i18n";

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





function $430f30ed08ec25fa$export$62b9571f283ff5c2(props, state) {
    let { name: name, isReadOnly: isReadOnly, isRequired: isRequired, isDisabled: isDisabled, orientation: orientation = 'vertical', validationBehavior: validationBehavior = 'aria' } = props;
    let { direction: direction } = (0, $czmJy$useLocale)();
    let { isInvalid: isInvalid, validationErrors: validationErrors, validationDetails: validationDetails } = state.displayValidation;
    let { labelProps: labelProps, fieldProps: fieldProps, descriptionProps: descriptionProps, errorMessageProps: errorMessageProps } = (0, $czmJy$useField)({
        ...props,
        // Radio group is not an HTML input element so it
        // shouldn't be labeled by a <label> element.
        labelElementType: 'span',
        isInvalid: state.isInvalid,
        errorMessage: props.errorMessage || validationErrors
    });
    let domProps = (0, $czmJy$filterDOMProps)(props, {
        labelable: true
    });
    // When the radio group loses focus, reset the focusable radio to null if
    // there is no selection. This allows tabbing into the group from either
    // direction to go to the first or last radio.
    let { focusWithinProps: focusWithinProps } = (0, $czmJy$useFocusWithin)({
        onBlurWithin (e) {
            var _props_onBlur;
            (_props_onBlur = props.onBlur) === null || _props_onBlur === void 0 ? void 0 : _props_onBlur.call(props, e);
            if (!state.selectedValue) state.setLastFocusedValue(null);
        },
        onFocusWithin: props.onFocus,
        onFocusWithinChange: props.onFocusChange
    });
    let onKeyDown = (e)=>{
        let nextDir;
        switch(e.key){
            case 'ArrowRight':
                if (direction === 'rtl' && orientation !== 'vertical') nextDir = 'prev';
                else nextDir = 'next';
                break;
            case 'ArrowLeft':
                if (direction === 'rtl' && orientation !== 'vertical') nextDir = 'next';
                else nextDir = 'prev';
                break;
            case 'ArrowDown':
                nextDir = 'next';
                break;
            case 'ArrowUp':
                nextDir = 'prev';
                break;
            default:
                return;
        }
        e.preventDefault();
        let walker = (0, $czmJy$getFocusableTreeWalker)(e.currentTarget, {
            from: e.target
        });
        let nextElem;
        if (nextDir === 'next') {
            nextElem = walker.nextNode();
            if (!nextElem) {
                walker.currentNode = e.currentTarget;
                nextElem = walker.firstChild();
            }
        } else {
            nextElem = walker.previousNode();
            if (!nextElem) {
                walker.currentNode = e.currentTarget;
                nextElem = walker.lastChild();
            }
        }
        if (nextElem) {
            // Call focus on nextElem so that keyboard navigation scrolls the radio into view
            nextElem.focus();
            state.setSelectedValue(nextElem.value);
        }
    };
    let groupName = (0, $czmJy$useId)(name);
    (0, $884aeceb3d67f00f$export$37b65e5b5444d35c).set(state, {
        name: groupName,
        descriptionId: descriptionProps.id,
        errorMessageId: errorMessageProps.id,
        validationBehavior: validationBehavior
    });
    return {
        radioGroupProps: (0, $czmJy$mergeProps)(domProps, {
            // https://www.w3.org/TR/wai-aria-1.2/#radiogroup
            role: 'radiogroup',
            onKeyDown: onKeyDown,
            'aria-invalid': state.isInvalid || undefined,
            'aria-errormessage': props['aria-errormessage'],
            'aria-readonly': isReadOnly || undefined,
            'aria-required': isRequired || undefined,
            'aria-disabled': isDisabled || undefined,
            'aria-orientation': orientation,
            ...fieldProps,
            ...focusWithinProps
        }),
        labelProps: labelProps,
        descriptionProps: descriptionProps,
        errorMessageProps: errorMessageProps,
        isInvalid: isInvalid,
        validationErrors: validationErrors,
        validationDetails: validationDetails
    };
}


export {$430f30ed08ec25fa$export$62b9571f283ff5c2 as useRadioGroup};
//# sourceMappingURL=useRadioGroup.module.js.map
