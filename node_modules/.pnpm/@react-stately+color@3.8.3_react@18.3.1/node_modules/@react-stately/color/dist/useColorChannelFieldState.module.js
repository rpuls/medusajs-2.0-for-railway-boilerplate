import {useColor as $aa90ad8b2b1d015f$export$5aadd9c0606af5c2} from "./useColor.module.js";
import {useNumberFieldState as $52OvP$useNumberFieldState} from "@react-stately/numberfield";
import {useControlledState as $52OvP$useControlledState} from "@react-stately/utils";
import {useMemo as $52OvP$useMemo} from "react";





function $31a863bb88e75dd6$export$b9fc0d69c9190c4a(props) {
    let { channel: channel, colorSpace: colorSpace, locale: locale } = props;
    let black = (0, $aa90ad8b2b1d015f$export$5aadd9c0606af5c2)('#000');
    let initialValue = (0, $aa90ad8b2b1d015f$export$5aadd9c0606af5c2)(props.value);
    let initialDefaultValue = (0, $aa90ad8b2b1d015f$export$5aadd9c0606af5c2)(props.defaultValue);
    let [colorValue, setColor] = (0, $52OvP$useControlledState)(initialValue, initialDefaultValue !== null && initialDefaultValue !== void 0 ? initialDefaultValue : null, props.onChange);
    let color = (0, $52OvP$useMemo)(()=>{
        let nonNullColorValue = colorValue || black;
        return colorSpace && nonNullColorValue ? nonNullColorValue.toFormat(colorSpace) : nonNullColorValue;
    }, [
        black,
        colorValue,
        colorSpace
    ]);
    let value = color.getChannelValue(channel);
    let range = color.getChannelRange(channel);
    let formatOptions = (0, $52OvP$useMemo)(()=>color.getChannelFormatOptions(channel), [
        color,
        channel
    ]);
    let multiplier = formatOptions.style === 'percent' && range.maxValue === 100 ? 100 : 1;
    let numberFieldState = (0, $52OvP$useNumberFieldState)({
        locale: locale,
        value: colorValue === null ? NaN : value / multiplier,
        onChange: (v)=>{
            if (!Number.isNaN(v)) setColor(color.withChannelValue(channel, v * multiplier));
            else setColor(null);
        },
        minValue: range.minValue / multiplier,
        maxValue: range.maxValue / multiplier,
        step: range.step / multiplier,
        formatOptions: formatOptions
    });
    return {
        ...numberFieldState,
        colorValue: color
    };
}


export {$31a863bb88e75dd6$export$b9fc0d69c9190c4a as useColorChannelFieldState};
//# sourceMappingURL=useColorChannelFieldState.module.js.map
