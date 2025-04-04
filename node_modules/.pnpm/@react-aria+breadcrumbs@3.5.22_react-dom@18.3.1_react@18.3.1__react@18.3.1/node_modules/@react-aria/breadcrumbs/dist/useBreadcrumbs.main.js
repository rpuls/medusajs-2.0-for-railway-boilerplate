var $907e591fa8a9456d$exports = require("./intlStrings.main.js");
var $3qDYu$reactariautils = require("@react-aria/utils");
var $3qDYu$reactariai18n = require("@react-aria/i18n");


function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}

function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "useBreadcrumbs", () => $2b6c6844f922ad13$export$8cefe241bd876ca0);
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


function $2b6c6844f922ad13$export$8cefe241bd876ca0(props) {
    let { 'aria-label': ariaLabel, ...otherProps } = props;
    let strings = (0, $3qDYu$reactariai18n.useLocalizedStringFormatter)((0, ($parcel$interopDefault($907e591fa8a9456d$exports))), '@react-aria/breadcrumbs');
    return {
        navProps: {
            ...(0, $3qDYu$reactariautils.filterDOMProps)(otherProps, {
                labelable: true
            }),
            'aria-label': ariaLabel || strings.format('breadcrumbs')
        }
    };
}


//# sourceMappingURL=useBreadcrumbs.main.js.map
