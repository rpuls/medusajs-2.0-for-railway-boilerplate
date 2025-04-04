import $iYaQO$intlStringsmodulejs from "./intlStrings.module.js";
import $iYaQO$react from "react";
import {useLabels as $iYaQO$useLabels} from "@react-aria/utils";
import {useLocalizedStringFormatter as $iYaQO$useLocalizedStringFormatter} from "@react-aria/i18n";
import {VisuallyHidden as $iYaQO$VisuallyHidden} from "@react-aria/visually-hidden";


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




function $86ea4cb521eb2e37$export$2317d149ed6f78c4(props) {
    let { onDismiss: onDismiss, ...otherProps } = props;
    let stringFormatter = (0, $iYaQO$useLocalizedStringFormatter)((0, ($parcel$interopDefault($iYaQO$intlStringsmodulejs))), '@react-aria/overlays');
    let labels = (0, $iYaQO$useLabels)(otherProps, stringFormatter.format('dismiss'));
    let onClick = ()=>{
        if (onDismiss) onDismiss();
    };
    return /*#__PURE__*/ (0, $iYaQO$react).createElement((0, $iYaQO$VisuallyHidden), null, /*#__PURE__*/ (0, $iYaQO$react).createElement("button", {
        ...labels,
        tabIndex: -1,
        onClick: onClick,
        style: {
            width: 1,
            height: 1
        }
    }));
}


export {$86ea4cb521eb2e37$export$2317d149ed6f78c4 as DismissButton};
//# sourceMappingURL=DismissButton.module.js.map
