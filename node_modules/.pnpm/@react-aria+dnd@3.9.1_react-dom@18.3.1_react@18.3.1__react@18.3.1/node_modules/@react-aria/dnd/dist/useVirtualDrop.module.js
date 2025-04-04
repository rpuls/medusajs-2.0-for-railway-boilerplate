import {useDragSession as $67560de7c78cb232$export$418e185dd3f1b968} from "./DragManager.module.js";
import $gKRvW$intlStringsmodulejs from "./intlStrings.module.js";
import {useDragModality as $7252cd45fc48c07c$export$49bac5d6d4b352ea} from "./utils.module.js";
import {useDescription as $gKRvW$useDescription} from "@react-aria/utils";
import {useLocalizedStringFormatter as $gKRvW$useLocalizedStringFormatter} from "@react-aria/i18n";


function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}
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




const $224594fe3e57ff1e$var$MESSAGES = {
    keyboard: 'dropDescriptionKeyboard',
    touch: 'dropDescriptionTouch',
    virtual: 'dropDescriptionVirtual'
};
function $224594fe3e57ff1e$export$62447ad3d2ec7da6() {
    let stringFormatter = (0, $gKRvW$useLocalizedStringFormatter)((0, ($parcel$interopDefault($gKRvW$intlStringsmodulejs))), '@react-aria/dnd');
    let modality = (0, $7252cd45fc48c07c$export$49bac5d6d4b352ea)();
    let dragSession = $67560de7c78cb232$export$418e185dd3f1b968();
    let descriptionProps = (0, $gKRvW$useDescription)(dragSession ? stringFormatter.format($224594fe3e57ff1e$var$MESSAGES[modality]) : '');
    return {
        dropProps: {
            ...descriptionProps,
            // Mobile Safari does not properly bubble click events on elements except links or inputs
            // unless there is an onclick handler bound directly to the element itself. By adding this
            // handler, React will take care of adding that for us, and we are able to handle document
            // level click events in the DragManager.
            // See https://www.quirksmode.org/blog/archives/2010/09/click_event_del.html
            onClick: ()=>{}
        }
    };
}


export {$224594fe3e57ff1e$export$62447ad3d2ec7da6 as useVirtualDrop};
//# sourceMappingURL=useVirtualDrop.module.js.map
