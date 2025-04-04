import {generateId as $99b62ae3ff97ec45$export$567fc7097e064344} from "./utils.module.js";
import {useLabels as $jik2T$useLabels, mergeProps as $jik2T$mergeProps} from "@react-aria/utils";
import {useHasTabbableChild as $jik2T$useHasTabbableChild} from "@react-aria/focus";

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


function $34bce698202e07cb$export$fae0121b5afe572d(props, state, ref) {
    // The tabpanel should have tabIndex=0 when there are no tabbable elements within it.
    // Otherwise, tabbing from the focused tab should go directly to the first tabbable element
    // within the tabpanel.
    let tabIndex = (0, $jik2T$useHasTabbableChild)(ref) ? undefined : 0;
    var _props_id;
    const id = (0, $99b62ae3ff97ec45$export$567fc7097e064344)(state, (_props_id = props.id) !== null && _props_id !== void 0 ? _props_id : state === null || state === void 0 ? void 0 : state.selectedKey, 'tabpanel');
    const tabPanelProps = (0, $jik2T$useLabels)({
        ...props,
        id: id,
        'aria-labelledby': (0, $99b62ae3ff97ec45$export$567fc7097e064344)(state, state === null || state === void 0 ? void 0 : state.selectedKey, 'tab')
    });
    return {
        tabPanelProps: (0, $jik2T$mergeProps)(tabPanelProps, {
            tabIndex: tabIndex,
            role: 'tabpanel',
            'aria-describedby': props['aria-describedby'],
            'aria-details': props['aria-details']
        })
    };
}


export {$34bce698202e07cb$export$fae0121b5afe572d as useTabPanel};
//# sourceMappingURL=useTabPanel.module.js.map
