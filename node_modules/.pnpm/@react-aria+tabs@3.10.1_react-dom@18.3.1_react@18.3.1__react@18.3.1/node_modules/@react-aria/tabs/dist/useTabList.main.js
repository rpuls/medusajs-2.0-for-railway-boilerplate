var $a217ebca77471970$exports = require("./utils.main.js");
var $283e5d8830177ead$exports = require("./TabsKeyboardDelegate.main.js");
var $c5HcZ$reactariautils = require("@react-aria/utils");
var $c5HcZ$reactariai18n = require("@react-aria/i18n");
var $c5HcZ$react = require("react");
var $c5HcZ$reactariaselection = require("@react-aria/selection");


function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "useTabList", () => $f2b4a4926440e901$export$773e389e644c5874);
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





function $f2b4a4926440e901$export$773e389e644c5874(props, state, ref) {
    let { orientation: orientation = 'horizontal', keyboardActivation: keyboardActivation = 'automatic' } = props;
    let { collection: collection, selectionManager: manager, disabledKeys: disabledKeys } = state;
    let { direction: direction } = (0, $c5HcZ$reactariai18n.useLocale)();
    let delegate = (0, $c5HcZ$react.useMemo)(()=>new (0, $283e5d8830177ead$exports.TabsKeyboardDelegate)(collection, direction, orientation, disabledKeys), [
        collection,
        disabledKeys,
        orientation,
        direction
    ]);
    let { collectionProps: collectionProps } = (0, $c5HcZ$reactariaselection.useSelectableCollection)({
        ref: ref,
        selectionManager: manager,
        keyboardDelegate: delegate,
        selectOnFocus: keyboardActivation === 'automatic',
        disallowEmptySelection: true,
        scrollRef: ref,
        linkBehavior: 'selection'
    });
    // Compute base id for all tabs
    let tabsId = (0, $c5HcZ$reactariautils.useId)();
    (0, $a217ebca77471970$exports.tabsIds).set(state, tabsId);
    let tabListLabelProps = (0, $c5HcZ$reactariautils.useLabels)({
        ...props,
        id: tabsId
    });
    return {
        tabListProps: {
            ...(0, $c5HcZ$reactariautils.mergeProps)(collectionProps, tabListLabelProps),
            role: 'tablist',
            'aria-orientation': orientation,
            tabIndex: undefined
        }
    };
}


//# sourceMappingURL=useTabList.main.js.map
