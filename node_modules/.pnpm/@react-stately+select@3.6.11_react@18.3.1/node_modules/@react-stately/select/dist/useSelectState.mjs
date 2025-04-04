import {useFormValidationState as $6FfNf$useFormValidationState} from "@react-stately/form";
import {useOverlayTriggerState as $6FfNf$useOverlayTriggerState} from "@react-stately/overlays";
import {useSingleSelectListState as $6FfNf$useSingleSelectListState} from "@react-stately/list";
import {useState as $6FfNf$useState} from "react";

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



function $2bc3a590c5373a4e$export$5159ec8b34d4ec12(props) {
    let triggerState = (0, $6FfNf$useOverlayTriggerState)(props);
    let [focusStrategy, setFocusStrategy] = (0, $6FfNf$useState)(null);
    let listState = (0, $6FfNf$useSingleSelectListState)({
        ...props,
        onSelectionChange: (key)=>{
            if (props.onSelectionChange != null) props.onSelectionChange(key);
            triggerState.close();
            validationState.commitValidation();
        }
    });
    let validationState = (0, $6FfNf$useFormValidationState)({
        ...props,
        value: listState.selectedKey
    });
    let [isFocused, setFocused] = (0, $6FfNf$useState)(false);
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


export {$2bc3a590c5373a4e$export$5159ec8b34d4ec12 as useSelectState};
//# sourceMappingURL=useSelectState.module.js.map
