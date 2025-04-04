import $kMaRF$intlStringsmodulejs from "./intlStrings.mjs";
import {filterDOMProps as $kMaRF$filterDOMProps, useId as $kMaRF$useId} from "@react-aria/utils";
import {useMemo as $kMaRF$useMemo} from "react";
import {parseColor as $kMaRF$parseColor} from "@react-stately/color";
import {useLocale as $kMaRF$useLocale, useLocalizedStringFormatter as $kMaRF$useLocalizedStringFormatter} from "@react-aria/i18n";


function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}
/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */ 




function $2993fcad7650b98d$export$9060ae606178d849(props) {
    let { color: value, colorName: colorName } = props;
    let nonNullValue = value || '#fff0';
    let color = (0, $kMaRF$useMemo)(()=>typeof nonNullValue === 'string' ? (0, $kMaRF$parseColor)(nonNullValue) : nonNullValue, [
        nonNullValue
    ]);
    let { locale: locale } = (0, $kMaRF$useLocale)();
    let DOMProps = (0, $kMaRF$filterDOMProps)(props, {
        labelable: true
    });
    let stringFormatter = (0, $kMaRF$useLocalizedStringFormatter)((0, ($parcel$interopDefault($kMaRF$intlStringsmodulejs))), '@react-aria/color');
    let id = (0, $kMaRF$useId)(props.id);
    if (!colorName) colorName = color.getChannelValue('alpha') === 0 ? stringFormatter.format('transparent') : color.getColorName(locale);
    return {
        colorSwatchProps: {
            ...DOMProps,
            role: 'img',
            'aria-roledescription': stringFormatter.format('colorSwatch'),
            'aria-label': [
                colorName,
                props['aria-label'] || ''
            ].filter(Boolean).join(', '),
            'aria-labelledby': props['aria-labelledby'] ? `${id} ${props['aria-labelledby']}` : undefined,
            id: id,
            style: {
                backgroundColor: color.toString('css'),
                // @ts-ignore
                forcedColorAdjust: 'none'
            }
        },
        color: color || null
    };
}


export {$2993fcad7650b98d$export$9060ae606178d849 as useColorSwatch};
//# sourceMappingURL=useColorSwatch.module.js.map
