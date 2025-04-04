var $jLhmn$reactariautils = require("@react-aria/utils");
var $jLhmn$reactariaselection = require("@react-aria/selection");
var $jLhmn$react = require("react");
var $jLhmn$reactarialabel = require("@react-aria/label");
var $jLhmn$reactariainteractions = require("@react-aria/interactions");
var $jLhmn$reactariagridlist = require("@react-aria/gridlist");
var $jLhmn$reactariai18n = require("@react-aria/i18n");


function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "hookData", () => $09704b0efefe5140$export$653eddfc964b0f8a);
$parcel$export(module.exports, "useTagGroup", () => $09704b0efefe5140$export$4f8b5cda58b7e8ff);
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






const $09704b0efefe5140$export$653eddfc964b0f8a = new WeakMap();
function $09704b0efefe5140$export$4f8b5cda58b7e8ff(props, state, ref) {
    let { direction: direction } = (0, $jLhmn$reactariai18n.useLocale)();
    let keyboardDelegate = props.keyboardDelegate || new (0, $jLhmn$reactariaselection.ListKeyboardDelegate)({
        collection: state.collection,
        ref: ref,
        orientation: 'horizontal',
        direction: direction,
        disabledKeys: state.disabledKeys,
        disabledBehavior: state.selectionManager.disabledBehavior
    });
    let { labelProps: labelProps, fieldProps: fieldProps, descriptionProps: descriptionProps, errorMessageProps: errorMessageProps } = (0, $jLhmn$reactarialabel.useField)({
        ...props,
        labelElementType: 'span'
    });
    let { gridProps: gridProps } = (0, $jLhmn$reactariagridlist.useGridList)({
        ...props,
        ...fieldProps,
        keyboardDelegate: keyboardDelegate,
        shouldFocusWrap: true,
        linkBehavior: 'override'
    }, state, ref);
    let [isFocusWithin, setFocusWithin] = (0, $jLhmn$react.useState)(false);
    let { focusWithinProps: focusWithinProps } = (0, $jLhmn$reactariainteractions.useFocusWithin)({
        onFocusWithinChange: setFocusWithin
    });
    let domProps = (0, $jLhmn$reactariautils.filterDOMProps)(props);
    // If the last tag is removed, focus the container.
    let prevCount = (0, $jLhmn$react.useRef)(state.collection.size);
    (0, $jLhmn$react.useEffect)(()=>{
        if (ref.current && prevCount.current > 0 && state.collection.size === 0 && isFocusWithin) ref.current.focus();
        prevCount.current = state.collection.size;
    }, [
        state.collection.size,
        isFocusWithin,
        ref
    ]);
    $09704b0efefe5140$export$653eddfc964b0f8a.set(state, {
        onRemove: props.onRemove
    });
    return {
        gridProps: (0, $jLhmn$reactariautils.mergeProps)(gridProps, domProps, {
            role: state.collection.size ? 'grid' : null,
            'aria-atomic': false,
            'aria-relevant': 'additions',
            'aria-live': isFocusWithin ? 'polite' : 'off',
            ...focusWithinProps,
            ...fieldProps
        }),
        labelProps: labelProps,
        descriptionProps: descriptionProps,
        errorMessageProps: errorMessageProps
    };
}


//# sourceMappingURL=useTagGroup.main.js.map
