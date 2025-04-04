var $5KJtg$reactstatelyform = require("@react-stately/form");
var $5KJtg$reactstatelyoverlays = require("@react-stately/overlays");
var $5KJtg$reactstatelylist = require("@react-stately/list");
var $5KJtg$react = require("react");


function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "useSelectState", () => $80ebb60e77198879$export$5159ec8b34d4ec12);
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



function $80ebb60e77198879$export$5159ec8b34d4ec12(props) {
    let triggerState = (0, $5KJtg$reactstatelyoverlays.useOverlayTriggerState)(props);
    let [focusStrategy, setFocusStrategy] = (0, $5KJtg$react.useState)(null);
    let listState = (0, $5KJtg$reactstatelylist.useSingleSelectListState)({
        ...props,
        onSelectionChange: (key)=>{
            if (props.onSelectionChange != null) props.onSelectionChange(key);
            triggerState.close();
            validationState.commitValidation();
        }
    });
    let validationState = (0, $5KJtg$reactstatelyform.useFormValidationState)({
        ...props,
        value: listState.selectedKey
    });
    let [isFocused, setFocused] = (0, $5KJtg$react.useState)(false);
    return {
        ...validationState,
        ...listState,
        ...triggerState,
        focusStrategy: focusStrategy,
        open (focusStrategy = null) {
            // Don't open if the collection is empty.
            if (listState.collection.size !== 0) {
                setFocusStrategy(focusStrategy);
                triggerState.open();
            }
        },
        toggle (focusStrategy = null) {
            if (listState.collection.size !== 0) {
                setFocusStrategy(focusStrategy);
                triggerState.toggle();
            }
        },
        isFocused: isFocused,
        setFocused: setFocused
    };
}


//# sourceMappingURL=useSelectState.main.js.map
