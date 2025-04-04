import $lFxPb$intlStringsmodulejs from "./intlStrings.mjs";
import {filterDOMProps as $lFxPb$filterDOMProps} from "@react-aria/utils";
import {useLocalizedStringFormatter as $lFxPb$useLocalizedStringFormatter} from "@react-aria/i18n";


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


function $848231d7a2b3998e$export$8cefe241bd876ca0(props) {
    let { 'aria-label': ariaLabel, ...otherProps } = props;
    let strings = (0, $lFxPb$useLocalizedStringFormatter)((0, ($parcel$interopDefault($lFxPb$intlStringsmodulejs))), '@react-aria/breadcrumbs');
    return {
        navProps: {
            ...(0, $lFxPb$filterDOMProps)(otherProps, {
                labelable: true
            }),
            'aria-label': ariaLabel || strings.format('breadcrumbs')
        }
    };
}


export {$848231d7a2b3998e$export$8cefe241bd876ca0 as useBreadcrumbs};
//# sourceMappingURL=useBreadcrumbs.module.js.map
