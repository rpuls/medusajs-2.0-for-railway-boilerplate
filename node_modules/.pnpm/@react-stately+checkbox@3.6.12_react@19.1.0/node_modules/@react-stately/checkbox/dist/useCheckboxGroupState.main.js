var $6SsBH$reactstatelyform = require("@react-stately/form");
var $6SsBH$reactstatelyutils = require("@react-stately/utils");
var $6SsBH$react = require("react");


function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "useCheckboxGroupState", () => $943f4c622056df75$export$daff6da51032a415);
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


function $943f4c622056df75$export$daff6da51032a415(props = {}) {
    let [selectedValues, setValue] = (0, $6SsBH$reactstatelyutils.useControlledState)(props.value, props.defaultValue || [], props.onChange);
    let isRequired = !!props.isRequired && selectedValues.length === 0;
    let invalidValues = (0, $6SsBH$react.useRef)(new Map());
    let validation = (0, $6SsBH$reactstatelyform.useFormValidationState)({
        ...props,
        value: selectedValues
    });
    let isInvalid = validation.displayValidation.isInvalid;
    var _props_validationState;
    const state = {
        ...validation,
        value: selectedValues,
        setValue (value) {
            if (props.isReadOnly || props.isDisabled) return;
            setValue(value);
        },
        isDisabled: props.isDisabled || false,
        isReadOnly: props.isReadOnly || false,
        isSelected (value) {
            return selectedValues.includes(value);
        },
        addValue (value) {
            if (props.isReadOnly || props.isDisabled) return;
            if (!selectedValues.includes(value)) setValue(selectedValues.concat(value));
        },
        removeValue (value) {
            if (props.isReadOnly || props.isDisabled) return;
            if (selectedValues.includes(value)) setValue(selectedValues.filter((existingValue)=>existingValue !== value));
        },
        toggleValue (value) {
            if (props.isReadOnly || props.isDisabled) return;
            if (selectedValues.includes(value)) setValue(selectedValues.filter((existingValue)=>existingValue !== value));
            else setValue(selectedValues.concat(value));
        },
        setInvalid (value, v) {
            let s = new Map(invalidValues.current);
            if (v.isInvalid) s.set(value, v);
            else s.delete(value);
            invalidValues.current = s;
            validation.updateValidation((0, $6SsBH$reactstatelyform.mergeValidation)(...s.values()));
        },
        validationState: (_props_validationState = props.validationState) !== null && _props_validationState !== void 0 ? _props_validationState : isInvalid ? 'invalid' : null,
        isInvalid: isInvalid,
        isRequired: isRequired
    };
    return state;
}


//# sourceMappingURL=useCheckboxGroupState.main.js.map
