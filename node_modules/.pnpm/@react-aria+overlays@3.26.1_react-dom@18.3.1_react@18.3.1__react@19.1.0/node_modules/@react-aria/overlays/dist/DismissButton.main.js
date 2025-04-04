var $90f032faf016e1fb$exports = require("./intlStrings.main.js");
var $21EvL$react = require("react");
var $21EvL$reactariautils = require("@react-aria/utils");
var $21EvL$reactariai18n = require("@react-aria/i18n");
var $21EvL$reactariavisuallyhidden = require("@react-aria/visually-hidden");


function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}

function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "DismissButton", () => $f69bb3e6457495cc$export$2317d149ed6f78c4);
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




function $f69bb3e6457495cc$export$2317d149ed6f78c4(props) {
    let { onDismiss: onDismiss, ...otherProps } = props;
    let stringFormatter = (0, $21EvL$reactariai18n.useLocalizedStringFormatter)((0, ($parcel$interopDefault($90f032faf016e1fb$exports))), '@react-aria/overlays');
    let labels = (0, $21EvL$reactariautils.useLabels)(otherProps, stringFormatter.format('dismiss'));
    let onClick = ()=>{
        if (onDismiss) onDismiss();
    };
    return /*#__PURE__*/ (0, ($parcel$interopDefault($21EvL$react))).createElement((0, $21EvL$reactariavisuallyhidden.VisuallyHidden), null, /*#__PURE__*/ (0, ($parcel$interopDefault($21EvL$react))).createElement("button", {
        ...labels,
        tabIndex: -1,
        onClick: onClick,
        style: {
            width: 1,
            height: 1
        }
    }));
}


//# sourceMappingURL=DismissButton.main.js.map
