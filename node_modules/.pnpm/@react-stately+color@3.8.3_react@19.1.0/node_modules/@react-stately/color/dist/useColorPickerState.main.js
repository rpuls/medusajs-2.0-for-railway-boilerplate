var $83fe1a57d631223b$exports = require("./Color.main.js");
var $f8b3be23ba4462b1$exports = require("./useColor.main.js");
var $1Pz5H$reactstatelyutils = require("@react-stately/utils");


function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "useColorPickerState", () => $f31788ea48a5c383$export$dc6b73b623f8645f);



function $f31788ea48a5c383$export$dc6b73b623f8645f(props) {
    let value = (0, $f8b3be23ba4462b1$exports.useColor)(props.value);
    let defaultValue = (0, $f8b3be23ba4462b1$exports.useColor)(props.defaultValue || '#000000');
    let [color, setColor] = (0, $1Pz5H$reactstatelyutils.useControlledState)(value || undefined, defaultValue, props.onChange);
    return {
        color: color,
        setColor (color) {
            if (color != null) setColor(color || (0, $83fe1a57d631223b$exports.parseColor)('#000000'));
        }
    };
}


//# sourceMappingURL=useColorPickerState.main.js.map
