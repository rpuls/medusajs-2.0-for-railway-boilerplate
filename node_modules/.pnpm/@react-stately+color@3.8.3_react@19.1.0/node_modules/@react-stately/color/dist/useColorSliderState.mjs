import {normalizeColor as $799cddbef784668f$export$4cde5df63f53f473, parseColor as $799cddbef784668f$export$6e865ea70d7724f} from "./Color.mjs";
import {useSliderState as $1Eavr$useSliderState} from "@react-stately/slider";
import {useControlledState as $1Eavr$useControlledState} from "@react-stately/utils";
import {useMemo as $1Eavr$useMemo} from "react";

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



function $25a25ac0d1624665$export$57bc203e1c9c6d44(props) {
    let { channel: channel, colorSpace: colorSpace, value: value, defaultValue: defaultValue, onChange: onChange, locale: locale, ...otherProps } = props;
    if (value == null && defaultValue == null) throw new Error('useColorSliderState requires a value or defaultValue');
    if (value) value = (0, $799cddbef784668f$export$4cde5df63f53f473)(value);
    if (defaultValue) defaultValue = (0, $799cddbef784668f$export$4cde5df63f53f473)(defaultValue);
    // safe to cast value and defaultValue to Color, one of them will always be defined because if neither are, we throw an error
    let [colorValue, setColor] = (0, $1Eavr$useControlledState)(value, defaultValue, onChange);
    let color = (0, $1Eavr$useMemo)(()=>colorSpace && colorValue ? colorValue.toFormat(colorSpace) : colorValue, [
        colorValue,
        colorSpace
    ]);
    let sliderState = (0, $1Eavr$useSliderState)({
        ...color.getChannelRange(channel),
        ...otherProps,
        // Unused except in getThumbValueLabel, which is overridden below. null to localize the TypeScript error for ignoring.
        // @ts-ignore
        numberFormatter: null,
        value: color.getChannelValue(channel),
        onChange (v) {
            setColor(color.withChannelValue(channel, v));
        },
        onChangeEnd (v) {
            // onChange will have already been called with the right value, this is just to trigger onChangeEnd
            if (props.onChangeEnd) props.onChangeEnd(color.withChannelValue(channel, v));
        }
    });
    let { step: step, pageSize: pageSize } = color.getChannelRange(channel);
    return {
        ...sliderState,
        value: color,
        setValue (value) {
            setColor((0, $799cddbef784668f$export$4cde5df63f53f473)(value));
        },
        getDisplayColor () {
            switch(channel){
                case 'hue':
                    return (0, $799cddbef784668f$export$6e865ea70d7724f)(`hsl(${color.getChannelValue('hue')}, 100%, 50%)`);
                case 'lightness':
                case 'brightness':
                case 'saturation':
                case 'red':
                case 'green':
                case 'blue':
                    return color.withChannelValue('alpha', 1);
                case 'alpha':
                    return color;
                default:
                    throw new Error('Unknown color channel: ' + channel);
            }
        },
        getThumbValueLabel () {
            return color.formatChannelValue(channel, locale);
        },
        step: step,
        pageSize: pageSize,
        isDragging: sliderState.isThumbDragging(0)
    };
}


export {$25a25ac0d1624665$export$57bc203e1c9c6d44 as useColorSliderState};
//# sourceMappingURL=useColorSliderState.module.js.map
