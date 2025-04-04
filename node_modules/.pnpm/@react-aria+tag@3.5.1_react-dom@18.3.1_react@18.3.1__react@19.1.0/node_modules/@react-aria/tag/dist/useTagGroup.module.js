import {filterDOMProps as $eUtJD$filterDOMProps, mergeProps as $eUtJD$mergeProps} from "@react-aria/utils";
import {ListKeyboardDelegate as $eUtJD$ListKeyboardDelegate} from "@react-aria/selection";
import {useState as $eUtJD$useState, useRef as $eUtJD$useRef, useEffect as $eUtJD$useEffect} from "react";
import {useField as $eUtJD$useField} from "@react-aria/label";
import {useFocusWithin as $eUtJD$useFocusWithin} from "@react-aria/interactions";
import {useGridList as $eUtJD$useGridList} from "@react-aria/gridlist";
import {useLocale as $eUtJD$useLocale} from "@react-aria/i18n";

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






const $d7323bca8d074eeb$export$653eddfc964b0f8a = new WeakMap();
function $d7323bca8d074eeb$export$4f8b5cda58b7e8ff(props, state, ref) {
    let { direction: direction } = (0, $eUtJD$useLocale)();
    let keyboardDelegate = props.keyboardDelegate || new (0, $eUtJD$ListKeyboardDelegate)({
        collection: state.collection,
        ref: ref,
        orientation: 'horizontal',
        direction: direction,
        disabledKeys: state.disabledKeys,
        disabledBehavior: state.selectionManager.disabledBehavior
    });
    let { labelProps: labelProps, fieldProps: fieldProps, descriptionProps: descriptionProps, errorMessageProps: errorMessageProps } = (0, $eUtJD$useField)({
        ...props,
        labelElementType: 'span'
    });
    let { gridProps: gridProps } = (0, $eUtJD$useGridList)({
        ...props,
        ...fieldProps,
        keyboardDelegate: keyboardDelegate,
        shouldFocusWrap: true,
        linkBehavior: 'override'
    }, state, ref);
    let [isFocusWithin, setFocusWithin] = (0, $eUtJD$useState)(false);
    let { focusWithinProps: focusWithinProps } = (0, $eUtJD$useFocusWithin)({
        onFocusWithinChange: setFocusWithin
    });
    let domProps = (0, $eUtJD$filterDOMProps)(props);
    // If the last tag is removed, focus the container.
    let prevCount = (0, $eUtJD$useRef)(state.collection.size);
    (0, $eUtJD$useEffect)(()=>{
        if (ref.current && prevCount.current > 0 && state.collection.size === 0 && isFocusWithin) ref.current.focus();
        prevCount.current = state.collection.size;
    }, [
        state.collection.size,
        isFocusWithin,
        ref
    ]);
    $d7323bca8d074eeb$export$653eddfc964b0f8a.set(state, {
        onRemove: props.onRemove
    });
    return {
        gridProps: (0, $eUtJD$mergeProps)(gridProps, domProps, {
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


export {$d7323bca8d074eeb$export$653eddfc964b0f8a as hookData, $d7323bca8d074eeb$export$4f8b5cda58b7e8ff as useTagGroup};
//# sourceMappingURL=useTagGroup.module.js.map
