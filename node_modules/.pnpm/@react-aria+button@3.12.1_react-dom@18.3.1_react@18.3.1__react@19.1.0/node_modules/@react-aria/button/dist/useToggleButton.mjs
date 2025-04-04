import {useButton as $701a24aa0da5b062$export$ea18c227d4417cc3} from "./useButton.mjs";
import {chain as $h7Tql$chain, mergeProps as $h7Tql$mergeProps} from "@react-aria/utils";

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

function $55f54f7887471b58$export$51e84d46ca0bc451(props, state, ref) {
    const { isSelected: isSelected } = state;
    const { isPressed: isPressed, buttonProps: buttonProps } = (0, $701a24aa0da5b062$export$ea18c227d4417cc3)({
        ...props,
        onPress: (0, $h7Tql$chain)(state.toggle, props.onPress)
    }, ref);
    return {
        isPressed: isPressed,
        isSelected: isSelected,
        isDisabled: props.isDisabled || false,
        buttonProps: (0, $h7Tql$mergeProps)(buttonProps, {
            'aria-pressed': isSelected
        })
    };
}


export {$55f54f7887471b58$export$51e84d46ca0bc451 as useToggleButton};
//# sourceMappingURL=useToggleButton.module.js.map
