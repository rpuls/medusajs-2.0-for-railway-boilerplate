var $28e10663603f5ea1$exports = require("./DragManager.main.js");
var $7c8adf3925a26206$exports = require("./intlStrings.main.js");
var $4620ae0dc40f0031$exports = require("./utils.main.js");
var $iGjBd$reactariautils = require("@react-aria/utils");
var $iGjBd$reactariai18n = require("@react-aria/i18n");


function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}

function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "useVirtualDrop", () => $419982e205c8e8dc$export$62447ad3d2ec7da6);
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




const $419982e205c8e8dc$var$MESSAGES = {
    keyboard: 'dropDescriptionKeyboard',
    touch: 'dropDescriptionTouch',
    virtual: 'dropDescriptionVirtual'
};
function $419982e205c8e8dc$export$62447ad3d2ec7da6() {
    let stringFormatter = (0, $iGjBd$reactariai18n.useLocalizedStringFormatter)((0, ($parcel$interopDefault($7c8adf3925a26206$exports))), '@react-aria/dnd');
    let modality = (0, $4620ae0dc40f0031$exports.useDragModality)();
    let dragSession = $28e10663603f5ea1$exports.useDragSession();
    let descriptionProps = (0, $iGjBd$reactariautils.useDescription)(dragSession ? stringFormatter.format($419982e205c8e8dc$var$MESSAGES[modality]) : '');
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


//# sourceMappingURL=useVirtualDrop.main.js.map
