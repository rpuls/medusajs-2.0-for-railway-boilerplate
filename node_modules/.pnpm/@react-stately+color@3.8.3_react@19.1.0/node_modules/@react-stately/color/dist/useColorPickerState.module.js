import {parseColor as $799cddbef784668f$export$6e865ea70d7724f} from "./Color.module.js";
import {useColor as $aa90ad8b2b1d015f$export$5aadd9c0606af5c2} from "./useColor.module.js";
import {useControlledState as $5GESt$useControlledState} from "@react-stately/utils";




function $309d2b7669014898$export$dc6b73b623f8645f(props) {
    let value = (0, $aa90ad8b2b1d015f$export$5aadd9c0606af5c2)(props.value);
    let defaultValue = (0, $aa90ad8b2b1d015f$export$5aadd9c0606af5c2)(props.defaultValue || '#000000');
    let [color, setColor] = (0, $5GESt$useControlledState)(value || undefined, defaultValue, props.onChange);
    return {
        color: color,
        setColor (color) {
            if (color != null) setColor(color || (0, $799cddbef784668f$export$6e865ea70d7724f)('#000000'));
        }
    };
}


export {$309d2b7669014898$export$dc6b73b623f8645f as useColorPickerState};
//# sourceMappingURL=useColorPickerState.module.js.map
