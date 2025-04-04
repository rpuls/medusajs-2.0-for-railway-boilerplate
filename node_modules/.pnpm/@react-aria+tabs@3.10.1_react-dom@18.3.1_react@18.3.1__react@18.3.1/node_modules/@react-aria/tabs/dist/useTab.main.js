var $a217ebca77471970$exports = require("./utils.main.js");
var $dX61C$reactariautils = require("@react-aria/utils");
var $dX61C$reactariafocus = require("@react-aria/focus");
var $dX61C$reactariaselection = require("@react-aria/selection");


function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "useTab", () => $4eeea1c984cc0628$export$fdf4756d5b8ef90a);
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



function $4eeea1c984cc0628$export$fdf4756d5b8ef90a(props, state, ref) {
    let { key: key, isDisabled: propsDisabled, shouldSelectOnPressUp: shouldSelectOnPressUp } = props;
    let { selectionManager: manager, selectedKey: selectedKey } = state;
    let isSelected = key === selectedKey;
    let isDisabled = propsDisabled || state.isDisabled || state.selectionManager.isDisabled(key);
    let { itemProps: itemProps, isPressed: isPressed } = (0, $dX61C$reactariaselection.useSelectableItem)({
        selectionManager: manager,
        key: key,
        ref: ref,
        isDisabled: isDisabled,
        shouldSelectOnPressUp: shouldSelectOnPressUp,
        linkBehavior: 'selection'
    });
    let tabId = (0, $a217ebca77471970$exports.generateId)(state, key, 'tab');
    let tabPanelId = (0, $a217ebca77471970$exports.generateId)(state, key, 'tabpanel');
    let { tabIndex: tabIndex } = itemProps;
    let item = state.collection.getItem(key);
    let domProps = (0, $dX61C$reactariautils.filterDOMProps)(item === null || item === void 0 ? void 0 : item.props, {
        labelable: true
    });
    delete domProps.id;
    let linkProps = (0, $dX61C$reactariautils.useLinkProps)(item === null || item === void 0 ? void 0 : item.props);
    let { focusableProps: focusableProps } = (0, $dX61C$reactariafocus.useFocusable)({
        isDisabled: isDisabled
    }, ref);
    return {
        tabProps: (0, $dX61C$reactariautils.mergeProps)(domProps, focusableProps, linkProps, itemProps, {
            id: tabId,
            'aria-selected': isSelected,
            'aria-disabled': isDisabled || undefined,
            'aria-controls': isSelected ? tabPanelId : undefined,
            tabIndex: isDisabled ? undefined : tabIndex,
            role: 'tab'
        }),
        isSelected: isSelected,
        isDisabled: isDisabled,
        isPressed: isPressed
    };
}


//# sourceMappingURL=useTab.main.js.map
