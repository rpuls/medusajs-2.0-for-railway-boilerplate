var $cVa5U$reactstatelyform = require("@react-stately/form");
var $cVa5U$reactstatelyutils = require("@react-stately/utils");
var $cVa5U$react = require("react");


function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "useRadioGroupState", () => $307db30b5687e2e8$export$bca9d026f8e704eb);
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


let $307db30b5687e2e8$var$instance = Math.round(Math.random() * 10000000000);
let $307db30b5687e2e8$var$i = 0;
function $307db30b5687e2e8$export$bca9d026f8e704eb(props) {
    // Preserved here for backward compatibility. React Aria now generates the name instead of stately.
    let name = (0, $cVa5U$react.useMemo)(()=>props.name || `radio-group-${$307db30b5687e2e8$var$instance}-${++$307db30b5687e2e8$var$i}`, [
        props.name
    ]);
    var _props_defaultValue;
    let [selectedValue, setSelected] = (0, $cVa5U$reactstatelyutils.useControlledState)(props.value, (_props_defaultValue = props.defaultValue) !== null && _props_defaultValue !== void 0 ? _props_defaultValue : null, props.onChange);
    let [lastFocusedValue, setLastFocusedValue] = (0, $cVa5U$react.useState)(null);
    let validation = (0, $cVa5U$reactstatelyform.useFormValidationState)({
        ...props,
        value: selectedValue
    });
    let setSelectedValue = (value)=>{
        if (!props.isReadOnly && !props.isDisabled) {
            setSelected(value);
            validation.commitValidation();
        }
    };
    let isInvalid = validation.displayValidation.isInvalid;
    return {
        ...validation,
        name: name,
        selectedValue: selectedValue,
        setSelectedValue: setSelectedValue,
        lastFocusedValue: lastFocusedValue,
        setLastFocusedValue: setLastFocusedValue,
        isDisabled: props.isDisabled || false,
        isReadOnly: props.isReadOnly || false,
        isRequired: props.isRequired || false,
        validationState: props.validationState || (isInvalid ? 'invalid' : null),
        isInvalid: isInvalid
    };
}


//# sourceMappingURL=useRadioGroupState.main.js.map
