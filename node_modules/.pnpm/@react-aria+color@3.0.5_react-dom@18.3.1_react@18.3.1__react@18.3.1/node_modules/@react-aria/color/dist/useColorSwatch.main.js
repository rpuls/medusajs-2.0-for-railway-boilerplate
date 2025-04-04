var $4a33e168940636d5$exports = require("./intlStrings.main.js");
var $gp2Sz$reactariautils = require("@react-aria/utils");
var $gp2Sz$react = require("react");
var $gp2Sz$reactstatelycolor = require("@react-stately/color");
var $gp2Sz$reactariai18n = require("@react-aria/i18n");


function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}

function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "useColorSwatch", () => $7c947b33be1ec2a6$export$9060ae606178d849);
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




function $7c947b33be1ec2a6$export$9060ae606178d849(props) {
    let { color: value, colorName: colorName } = props;
    let nonNullValue = value || '#fff0';
    let color = (0, $gp2Sz$react.useMemo)(()=>typeof nonNullValue === 'string' ? (0, $gp2Sz$reactstatelycolor.parseColor)(nonNullValue) : nonNullValue, [
        nonNullValue
    ]);
    let { locale: locale } = (0, $gp2Sz$reactariai18n.useLocale)();
    let DOMProps = (0, $gp2Sz$reactariautils.filterDOMProps)(props, {
        labelable: true
    });
    let stringFormatter = (0, $gp2Sz$reactariai18n.useLocalizedStringFormatter)((0, ($parcel$interopDefault($4a33e168940636d5$exports))), '@react-aria/color');
    let id = (0, $gp2Sz$reactariautils.useId)(props.id);
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


//# sourceMappingURL=useColorSwatch.main.js.map
