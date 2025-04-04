import {tabsIds as $99b62ae3ff97ec45$export$c5f62239608282b6} from "./utils.module.js";
import {TabsKeyboardDelegate as $bfc6f2d60b8a4c40$export$15010ca3c1abe90b} from "./TabsKeyboardDelegate.module.js";
import {useId as $bQNZs$useId, useLabels as $bQNZs$useLabels, mergeProps as $bQNZs$mergeProps} from "@react-aria/utils";
import {useLocale as $bQNZs$useLocale} from "@react-aria/i18n";
import {useMemo as $bQNZs$useMemo} from "react";
import {useSelectableCollection as $bQNZs$useSelectableCollection} from "@react-aria/selection";

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





function $58d314389b21fa3f$export$773e389e644c5874(props, state, ref) {
    let { orientation: orientation = 'horizontal', keyboardActivation: keyboardActivation = 'automatic' } = props;
    let { collection: collection, selectionManager: manager, disabledKeys: disabledKeys } = state;
    let { direction: direction } = (0, $bQNZs$useLocale)();
    let delegate = (0, $bQNZs$useMemo)(()=>new (0, $bfc6f2d60b8a4c40$export$15010ca3c1abe90b)(collection, direction, orientation, disabledKeys), [
        collection,
        disabledKeys,
        orientation,
        direction
    ]);
    let { collectionProps: collectionProps } = (0, $bQNZs$useSelectableCollection)({
        ref: ref,
        selectionManager: manager,
        keyboardDelegate: delegate,
        selectOnFocus: keyboardActivation === 'automatic',
        disallowEmptySelection: true,
        scrollRef: ref,
        linkBehavior: 'selection'
    });
    // Compute base id for all tabs
    let tabsId = (0, $bQNZs$useId)();
    (0, $99b62ae3ff97ec45$export$c5f62239608282b6).set(state, tabsId);
    let tabListLabelProps = (0, $bQNZs$useLabels)({
        ...props,
        id: tabsId
    });
    return {
        tabListProps: {
            ...(0, $bQNZs$mergeProps)(collectionProps, tabListLabelProps),
            role: 'tablist',
            'aria-orientation': orientation,
            tabIndex: undefined
        }
    };
}


export {$58d314389b21fa3f$export$773e389e644c5874 as useTabList};
//# sourceMappingURL=useTabList.module.js.map
