var $c49208f7d2aac50b$exports = require("./useToggleButton.main.js");
var $eYVcO$reactariatoolbar = require("@react-aria/toolbar");


function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "useToggleButtonGroup", () => $7d1e6c2af0d638cd$export$dd5580ae642f110f);
$parcel$export(module.exports, "useToggleButtonGroupItem", () => $7d1e6c2af0d638cd$export$bc53712daae3d6e6);
/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */ 

function $7d1e6c2af0d638cd$export$dd5580ae642f110f(props, state, ref) {
    let { isDisabled: isDisabled } = props;
    let { toolbarProps: toolbarProps } = (0, $eYVcO$reactariatoolbar.useToolbar)(props, ref);
    return {
        groupProps: {
            ...toolbarProps,
            role: state.selectionMode === 'single' ? 'radiogroup' : toolbarProps.role,
            'aria-disabled': isDisabled
        }
    };
}
function $7d1e6c2af0d638cd$export$bc53712daae3d6e6(props, state, ref) {
    let toggleState = {
        isSelected: state.selectedKeys.has(props.id),
        setSelected (isSelected) {
            state.setSelected(props.id, isSelected);
        },
        toggle () {
            state.toggleKey(props.id);
        }
    };
    let { isPressed: isPressed, isSelected: isSelected, isDisabled: isDisabled, buttonProps: buttonProps } = (0, $c49208f7d2aac50b$exports.useToggleButton)({
        ...props,
        id: undefined,
        isDisabled: props.isDisabled || state.isDisabled
    }, toggleState, ref);
    if (state.selectionMode === 'single') {
        buttonProps.role = 'radio';
        buttonProps['aria-checked'] = toggleState.isSelected;
        delete buttonProps['aria-pressed'];
    }
    return {
        isPressed: isPressed,
        isSelected: isSelected,
        isDisabled: isDisabled,
        buttonProps: buttonProps
    };
}


//# sourceMappingURL=useToggleButtonGroup.main.js.map
