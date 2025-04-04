import {generateId as $99b62ae3ff97ec45$export$567fc7097e064344} from "./utils.mjs";
import {filterDOMProps as $dObGJ$filterDOMProps, useLinkProps as $dObGJ$useLinkProps, mergeProps as $dObGJ$mergeProps} from "@react-aria/utils";
import {useFocusable as $dObGJ$useFocusable} from "@react-aria/focus";
import {useSelectableItem as $dObGJ$useSelectableItem} from "@react-aria/selection";

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



function $0175d55c2a017ebc$export$fdf4756d5b8ef90a(props, state, ref) {
    let { key: key, isDisabled: propsDisabled, shouldSelectOnPressUp: shouldSelectOnPressUp } = props;
    let { selectionManager: manager, selectedKey: selectedKey } = state;
    let isSelected = key === selectedKey;
    let isDisabled = propsDisabled || state.isDisabled || state.selectionManager.isDisabled(key);
    let { itemProps: itemProps, isPressed: isPressed } = (0, $dObGJ$useSelectableItem)({
        selectionManager: manager,
        key: key,
        ref: ref,
        isDisabled: isDisabled,
        shouldSelectOnPressUp: shouldSelectOnPressUp,
        linkBehavior: 'selection'
    });
    let tabId = (0, $99b62ae3ff97ec45$export$567fc7097e064344)(state, key, 'tab');
    let tabPanelId = (0, $99b62ae3ff97ec45$export$567fc7097e064344)(state, key, 'tabpanel');
    let { tabIndex: tabIndex } = itemProps;
    let item = state.collection.getItem(key);
    let domProps = (0, $dObGJ$filterDOMProps)(item === null || item === void 0 ? void 0 : item.props, {
        labelable: true
    });
    delete domProps.id;
    let linkProps = (0, $dObGJ$useLinkProps)(item === null || item === void 0 ? void 0 : item.props);
    let { focusableProps: focusableProps } = (0, $dObGJ$useFocusable)({
        isDisabled: isDisabled
    }, ref);
    return {
        tabProps: (0, $dObGJ$mergeProps)(domProps, focusableProps, linkProps, itemProps, {
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


export {$0175d55c2a017ebc$export$fdf4756d5b8ef90a as useTab};
//# sourceMappingURL=useTab.module.js.map
