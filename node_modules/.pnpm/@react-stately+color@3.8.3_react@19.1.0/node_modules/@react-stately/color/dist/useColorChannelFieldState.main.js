var $f8b3be23ba4462b1$exports = require("./useColor.main.js");
var $8s2vy$reactstatelynumberfield = require("@react-stately/numberfield");
var $8s2vy$reactstatelyutils = require("@react-stately/utils");
var $8s2vy$react = require("react");


function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "useColorChannelFieldState", () => $9f9c35e37074b99b$export$b9fc0d69c9190c4a);




function $9f9c35e37074b99b$export$b9fc0d69c9190c4a(props) {
    let { channel: channel, colorSpace: colorSpace, locale: locale } = props;
    let black = (0, $f8b3be23ba4462b1$exports.useColor)('#000');
    let initialValue = (0, $f8b3be23ba4462b1$exports.useColor)(props.value);
    let initialDefaultValue = (0, $f8b3be23ba4462b1$exports.useColor)(props.defaultValue);
    let [colorValue, setColor] = (0, $8s2vy$reactstatelyutils.useControlledState)(initialValue, initialDefaultValue !== null && initialDefaultValue !== void 0 ? initialDefaultValue : null, props.onChange);
    let color = (0, $8s2vy$react.useMemo)(()=>{
        let nonNullColorValue = colorValue || black;
        return colorSpace && nonNullColorValue ? nonNullColorValue.toFormat(colorSpace) : nonNullColorValue;
    }, [
        black,
        colorValue,
        colorSpace
    ]);
    let value = color.getChannelValue(channel);
    let range = color.getChannelRange(channel);
    let formatOptions = (0, $8s2vy$react.useMemo)(()=>color.getChannelFormatOptions(channel), [
        color,
        channel
    ]);
    let multiplier = formatOptions.style === 'percent' && range.maxValue === 100 ? 100 : 1;
    let numberFieldState = (0, $8s2vy$reactstatelynumberfield.useNumberFieldState)({
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


//# sourceMappingURL=useColorChannelFieldState.main.js.map
