var $a217ebca77471970$exports = require("./utils.main.js");
var $8Zd8I$reactariautils = require("@react-aria/utils");
var $8Zd8I$reactariafocus = require("@react-aria/focus");


function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "useTabPanel", () => $8db1928b18472a1f$export$fae0121b5afe572d);
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


function $8db1928b18472a1f$export$fae0121b5afe572d(props, state, ref) {
    // The tabpanel should have tabIndex=0 when there are no tabbable elements within it.
    // Otherwise, tabbing from the focused tab should go directly to the first tabbable element
    // within the tabpanel.
    let tabIndex = (0, $8Zd8I$reactariafocus.useHasTabbableChild)(ref) ? undefined : 0;
    var _props_id;
    const id = (0, $a217ebca77471970$exports.generateId)(state, (_props_id = props.id) !== null && _props_id !== void 0 ? _props_id : state === null || state === void 0 ? void 0 : state.selectedKey, 'tabpanel');
    const tabPanelProps = (0, $8Zd8I$reactariautils.useLabels)({
        ...props,
        id: id,
        'aria-labelledby': (0, $a217ebca77471970$exports.generateId)(state, state === null || state === void 0 ? void 0 : state.selectedKey, 'tab')
    });
    return {
        tabPanelProps: (0, $8Zd8I$reactariautils.mergeProps)(tabPanelProps, {
            tabIndex: tabIndex,
            role: 'tabpanel',
            'aria-describedby': props['aria-describedby'],
            'aria-details': props['aria-details']
        })
    };
}


//# sourceMappingURL=useTabPanel.main.js.map
