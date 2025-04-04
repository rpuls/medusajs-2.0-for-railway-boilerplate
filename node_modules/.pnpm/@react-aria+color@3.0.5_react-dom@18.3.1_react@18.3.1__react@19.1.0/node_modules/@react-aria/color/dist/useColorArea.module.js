import $8t1z9$intlStringsmodulejs from "./intlStrings.module.js";
import {useColorAreaGradient as $40297c24c53588e6$export$dd62420467d245ca} from "./useColorAreaGradient.module.js";
import {useGlobalListeners as $8t1z9$useGlobalListeners, focusWithoutScrolling as $8t1z9$focusWithoutScrolling, useFormReset as $8t1z9$useFormReset, mergeProps as $8t1z9$mergeProps, isIOS as $8t1z9$isIOS, isAndroid as $8t1z9$isAndroid, useLabels as $8t1z9$useLabels} from "@react-aria/utils";
import {useState as $8t1z9$useState, useCallback as $8t1z9$useCallback, useRef as $8t1z9$useRef} from "react";
import {useKeyboard as $8t1z9$useKeyboard, useMove as $8t1z9$useMove, useFocusWithin as $8t1z9$useFocusWithin, useFocus as $8t1z9$useFocus} from "@react-aria/interactions";
import {useLocalizedStringFormatter as $8t1z9$useLocalizedStringFormatter, useLocale as $8t1z9$useLocale} from "@react-aria/i18n";
import {useVisuallyHidden as $8t1z9$useVisuallyHidden} from "@react-aria/visually-hidden";


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






function $60bd7d6e45dcddfa$export$2f92a7a615a014f6(props, state) {
    let { isDisabled: isDisabled, inputXRef: inputXRef, inputYRef: inputYRef, containerRef: containerRef, 'aria-label': ariaLabel, xName: xName, yName: yName } = props;
    let stringFormatter = (0, $8t1z9$useLocalizedStringFormatter)((0, ($parcel$interopDefault($8t1z9$intlStringsmodulejs))), '@react-aria/color');
    let { addGlobalListener: addGlobalListener, removeGlobalListener: removeGlobalListener } = (0, $8t1z9$useGlobalListeners)();
    let { direction: direction, locale: locale } = (0, $8t1z9$useLocale)();
    let [focusedInput, setFocusedInput] = (0, $8t1z9$useState)(null);
    let focusInput = (0, $8t1z9$useCallback)((inputRef = inputXRef)=>{
        if (inputRef.current) (0, $8t1z9$focusWithoutScrolling)(inputRef.current);
    }, [
        inputXRef
    ]);
    (0, $8t1z9$useFormReset)(inputXRef, [
        state.xValue,
        state.yValue
    ], ([x, y])=>{
        let newColor = state.value.withChannelValue(state.channels.xChannel, x).withChannelValue(state.channels.yChannel, y);
        state.setValue(newColor);
    });
    let [valueChangedViaKeyboard, setValueChangedViaKeyboard] = (0, $8t1z9$useState)(false);
    let [valueChangedViaInputChangeEvent, setValueChangedViaInputChangeEvent] = (0, $8t1z9$useState)(false);
    let { xChannel: xChannel, yChannel: yChannel, zChannel: zChannel } = state.channels;
    let xChannelStep = state.xChannelStep;
    let yChannelStep = state.yChannelStep;
    let currentPosition = (0, $8t1z9$useRef)(null);
    let { keyboardProps: keyboardProps } = (0, $8t1z9$useKeyboard)({
        onKeyDown (e) {
            // these are the cases that useMove doesn't handle
            if (!/^(PageUp|PageDown|Home|End)$/.test(e.key)) {
                e.continuePropagation();
                return;
            }
            // same handling as useMove, don't need to stop propagation, useKeyboard will do that for us
            e.preventDefault();
            // remember to set this and unset it so that onChangeEnd is fired
            state.setDragging(true);
            setValueChangedViaKeyboard(true);
            let dir;
            switch(e.key){
                case 'PageUp':
                    state.incrementY(state.yChannelPageStep);
                    dir = 'y';
                    break;
                case 'PageDown':
                    state.decrementY(state.yChannelPageStep);
                    dir = 'y';
                    break;
                case 'Home':
                    direction === 'rtl' ? state.incrementX(state.xChannelPageStep) : state.decrementX(state.xChannelPageStep);
                    dir = 'x';
                    break;
                case 'End':
                    direction === 'rtl' ? state.decrementX(state.xChannelPageStep) : state.incrementX(state.xChannelPageStep);
                    dir = 'x';
                    break;
            }
            state.setDragging(false);
            if (dir) {
                let input = dir === 'x' ? inputXRef : inputYRef;
                focusInput(input);
                setFocusedInput(dir);
            }
        }
    });
    let moveHandler = {
        onMoveStart () {
            currentPosition.current = null;
            state.setDragging(true);
        },
        onMove ({ deltaX: deltaX, deltaY: deltaY, pointerType: pointerType, shiftKey: shiftKey }) {
            var _containerRef_current;
            let { incrementX: incrementX, decrementX: decrementX, incrementY: incrementY, decrementY: decrementY, xChannelPageStep: xChannelPageStep, xChannelStep: xChannelStep, yChannelPageStep: yChannelPageStep, yChannelStep: yChannelStep, getThumbPosition: getThumbPosition, setColorFromPoint: setColorFromPoint } = state;
            if (currentPosition.current == null) currentPosition.current = getThumbPosition();
            let { width: width, height: height } = ((_containerRef_current = containerRef.current) === null || _containerRef_current === void 0 ? void 0 : _containerRef_current.getBoundingClientRect()) || {
                width: 0,
                height: 0
            };
            let valueChanged = deltaX !== 0 || deltaY !== 0;
            if (pointerType === 'keyboard') {
                let deltaXValue = shiftKey && xChannelPageStep > xChannelStep ? xChannelPageStep : xChannelStep;
                let deltaYValue = shiftKey && yChannelPageStep > yChannelStep ? yChannelPageStep : yChannelStep;
                if (deltaX > 0 && direction === 'ltr' || deltaX < 0 && direction === 'rtl') incrementX(deltaXValue);
                else if (deltaX < 0 && direction === 'ltr' || deltaX > 0 && direction === 'rtl') decrementX(deltaXValue);
                else if (deltaY > 0) decrementY(deltaYValue);
                else if (deltaY < 0) incrementY(deltaYValue);
                setValueChangedViaKeyboard(valueChanged);
                // set the focused input based on which axis has the greater delta
                focusedInput = valueChanged && Math.abs(deltaY) > Math.abs(deltaX) ? 'y' : 'x';
                setFocusedInput(focusedInput);
            } else {
                currentPosition.current.x += (direction === 'rtl' ? -1 : 1) * deltaX / width;
                currentPosition.current.y += deltaY / height;
                setColorFromPoint(currentPosition.current.x, currentPosition.current.y);
            }
        },
        onMoveEnd () {
            isOnColorArea.current = false;
            state.setDragging(false);
            let input = focusedInput === 'x' ? inputXRef : inputYRef;
            focusInput(input);
        }
    };
    let { moveProps: movePropsThumb } = (0, $8t1z9$useMove)(moveHandler);
    let { focusWithinProps: focusWithinProps } = (0, $8t1z9$useFocusWithin)({
        onFocusWithinChange: (focusWithin)=>{
            if (!focusWithin) {
                setValueChangedViaKeyboard(false);
                setValueChangedViaInputChangeEvent(false);
            }
        }
    });
    let currentPointer = (0, $8t1z9$useRef)(undefined);
    let isOnColorArea = (0, $8t1z9$useRef)(false);
    let { moveProps: movePropsContainer } = (0, $8t1z9$useMove)({
        onMoveStart () {
            if (isOnColorArea.current) moveHandler.onMoveStart();
        },
        onMove (e) {
            if (isOnColorArea.current) moveHandler.onMove(e);
        },
        onMoveEnd () {
            if (isOnColorArea.current) moveHandler.onMoveEnd();
        }
    });
    let onThumbDown = (id)=>{
        if (!state.isDragging) {
            currentPointer.current = id;
            setValueChangedViaKeyboard(false);
            focusInput();
            state.setDragging(true);
            if (typeof PointerEvent !== 'undefined') addGlobalListener(window, 'pointerup', onThumbUp, false);
            else {
                addGlobalListener(window, 'mouseup', onThumbUp, false);
                addGlobalListener(window, 'touchend', onThumbUp, false);
            }
        }
    };
    let onThumbUp = (e)=>{
        var _e_changedTouches;
        var _e_pointerId;
        let id = (_e_pointerId = e.pointerId) !== null && _e_pointerId !== void 0 ? _e_pointerId : (_e_changedTouches = e.changedTouches) === null || _e_changedTouches === void 0 ? void 0 : _e_changedTouches[0].identifier;
        if (id === currentPointer.current) {
            setValueChangedViaKeyboard(false);
            focusInput();
            state.setDragging(false);
            currentPointer.current = undefined;
            isOnColorArea.current = false;
            if (typeof PointerEvent !== 'undefined') removeGlobalListener(window, 'pointerup', onThumbUp, false);
            else {
                removeGlobalListener(window, 'mouseup', onThumbUp, false);
                removeGlobalListener(window, 'touchend', onThumbUp, false);
            }
        }
    };
    let onColorAreaDown = (colorArea, id, clientX, clientY)=>{
        let rect = colorArea.getBoundingClientRect();
        let { width: width, height: height } = rect;
        let x = (clientX - rect.x) / width;
        let y = (clientY - rect.y) / height;
        if (direction === 'rtl') x = 1 - x;
        if (x >= 0 && x <= 1 && y >= 0 && y <= 1 && !state.isDragging && currentPointer.current === undefined) {
            isOnColorArea.current = true;
            setValueChangedViaKeyboard(false);
            currentPointer.current = id;
            state.setColorFromPoint(x, y);
            focusInput();
            state.setDragging(true);
            if (typeof PointerEvent !== 'undefined') addGlobalListener(window, 'pointerup', onColorAreaUp, false);
            else {
                addGlobalListener(window, 'mouseup', onColorAreaUp, false);
                addGlobalListener(window, 'touchend', onColorAreaUp, false);
            }
        }
    };
    let onColorAreaUp = (e)=>{
        var _e_changedTouches;
        var _e_pointerId;
        let id = (_e_pointerId = e.pointerId) !== null && _e_pointerId !== void 0 ? _e_pointerId : (_e_changedTouches = e.changedTouches) === null || _e_changedTouches === void 0 ? void 0 : _e_changedTouches[0].identifier;
        if (isOnColorArea.current && id === currentPointer.current) {
            isOnColorArea.current = false;
            setValueChangedViaKeyboard(false);
            currentPointer.current = undefined;
            state.setDragging(false);
            focusInput();
            if (typeof PointerEvent !== 'undefined') removeGlobalListener(window, 'pointerup', onColorAreaUp, false);
            else {
                removeGlobalListener(window, 'mouseup', onColorAreaUp, false);
                removeGlobalListener(window, 'touchend', onColorAreaUp, false);
            }
        }
    };
    let colorAreaInteractions = isDisabled ? {} : (0, $8t1z9$mergeProps)({
        ...typeof PointerEvent !== 'undefined' ? {
            onPointerDown: (e)=>{
                if (e.pointerType === 'mouse' && (e.button !== 0 || e.altKey || e.ctrlKey || e.metaKey)) return;
                onColorAreaDown(e.currentTarget, e.pointerId, e.clientX, e.clientY);
            }
        } : {
            onMouseDown: (e)=>{
                if (e.button !== 0 || e.altKey || e.ctrlKey || e.metaKey) return;
                onColorAreaDown(e.currentTarget, undefined, e.clientX, e.clientY);
            },
            onTouchStart: (e)=>{
                onColorAreaDown(e.currentTarget, e.changedTouches[0].identifier, e.changedTouches[0].clientX, e.changedTouches[0].clientY);
            }
        }
    }, movePropsContainer);
    let thumbInteractions = isDisabled ? {} : (0, $8t1z9$mergeProps)({
        ...typeof PointerEvent !== 'undefined' ? {
            onPointerDown: (e)=>{
                if (e.pointerType === 'mouse' && (e.button !== 0 || e.altKey || e.ctrlKey || e.metaKey)) return;
                onThumbDown(e.pointerId);
            }
        } : {
            onMouseDown: (e)=>{
                if (e.button !== 0 || e.altKey || e.ctrlKey || e.metaKey) return;
                onThumbDown(undefined);
            },
            onTouchStart: (e)=>{
                onThumbDown(e.changedTouches[0].identifier);
            }
        }
    }, focusWithinProps, keyboardProps, movePropsThumb);
    let { focusProps: xInputFocusProps } = (0, $8t1z9$useFocus)({
        onFocus: ()=>{
            setFocusedInput('x');
        }
    });
    let { focusProps: yInputFocusProps } = (0, $8t1z9$useFocus)({
        onFocus: ()=>{
            setFocusedInput('y');
        }
    });
    const onChange = (e)=>{
        const { target: target } = e;
        setValueChangedViaInputChangeEvent(true);
        if (target === inputXRef.current) state.setXValue(parseFloat(target.value));
        else if (target === inputYRef.current) state.setYValue(parseFloat(target.value));
    };
    let isMobile = (0, $8t1z9$isIOS)() || (0, $8t1z9$isAndroid)();
    let value = state.getDisplayColor();
    const getAriaValueTextForChannel = (0, $8t1z9$useCallback)((channel)=>{
        const isAfterInput = valueChangedViaInputChangeEvent || valueChangedViaKeyboard;
        return `${isAfterInput ? stringFormatter.format('colorNameAndValue', {
            name: value.getChannelName(channel, locale),
            value: value.formatChannelValue(channel, locale)
        }) : [
            stringFormatter.format('colorNameAndValue', {
                name: value.getChannelName(channel, locale),
                value: value.formatChannelValue(channel, locale)
            }),
            stringFormatter.format('colorNameAndValue', {
                name: value.getChannelName(channel === yChannel ? xChannel : yChannel, locale),
                value: value.formatChannelValue(channel === yChannel ? xChannel : yChannel, locale)
            }),
            stringFormatter.format('colorNameAndValue', {
                name: value.getChannelName(zChannel, locale),
                value: value.formatChannelValue(zChannel, locale)
            })
        ].join(', ')}, ${value.getColorName(locale)}`;
    }, [
        locale,
        value,
        stringFormatter,
        valueChangedViaInputChangeEvent,
        valueChangedViaKeyboard,
        xChannel,
        yChannel,
        zChannel
    ]);
    let colorPickerLabel = stringFormatter.format('colorPicker');
    let xInputLabellingProps = (0, $8t1z9$useLabels)({
        ...props,
        'aria-label': ariaLabel ? stringFormatter.format('colorInputLabel', {
            label: ariaLabel,
            channelLabel: colorPickerLabel
        }) : colorPickerLabel
    });
    let yInputLabellingProps = (0, $8t1z9$useLabels)({
        ...props,
        'aria-label': ariaLabel ? stringFormatter.format('colorInputLabel', {
            label: ariaLabel,
            channelLabel: colorPickerLabel
        }) : colorPickerLabel
    });
    let colorAreaLabellingProps = (0, $8t1z9$useLabels)({
        ...props,
        'aria-label': ariaLabel ? `${ariaLabel}, ${colorPickerLabel}` : undefined
    }, isMobile ? colorPickerLabel : undefined);
    let ariaRoleDescription = stringFormatter.format('twoDimensionalSlider');
    let { visuallyHiddenProps: visuallyHiddenProps } = (0, $8t1z9$useVisuallyHidden)({
        style: {
            opacity: '0.0001',
            width: '100%',
            height: '100%',
            pointerEvents: 'none'
        }
    });
    let { colorAreaStyleProps: colorAreaStyleProps, thumbStyleProps: thumbStyleProps } = (0, $40297c24c53588e6$export$dd62420467d245ca)({
        direction: direction,
        state: state,
        xChannel: xChannel,
        yChannel: yChannel,
        zChannel: zChannel
    });
    return {
        colorAreaProps: {
            ...colorAreaLabellingProps,
            ...colorAreaInteractions,
            ...colorAreaStyleProps,
            role: 'group'
        },
        thumbProps: {
            ...thumbInteractions,
            ...thumbStyleProps,
            role: 'presentation'
        },
        xInputProps: {
            ...xInputLabellingProps,
            ...visuallyHiddenProps,
            ...xInputFocusProps,
            type: 'range',
            min: state.value.getChannelRange(xChannel).minValue,
            max: state.value.getChannelRange(xChannel).maxValue,
            step: xChannelStep,
            'aria-roledescription': ariaRoleDescription,
            'aria-valuetext': getAriaValueTextForChannel(xChannel),
            'aria-orientation': 'horizontal',
            'aria-describedby': props['aria-describedby'],
            'aria-details': props['aria-details'],
            disabled: isDisabled,
            value: state.value.getChannelValue(xChannel),
            name: xName,
            tabIndex: isMobile || !focusedInput || focusedInput === 'x' ? undefined : -1,
            /*
        So that only a single "2d slider" control shows up when listing form elements for screen readers,
        add aria-hidden="true" to the unfocused control when the value has not changed via the keyboard,
        but remove aria-hidden to reveal the input for each channel when the value has changed with the keyboard.
      */ 'aria-hidden': isMobile || !focusedInput || focusedInput === 'x' || valueChangedViaKeyboard ? undefined : 'true',
            onChange: onChange
        },
        yInputProps: {
            ...yInputLabellingProps,
            ...visuallyHiddenProps,
            ...yInputFocusProps,
            type: 'range',
            min: state.value.getChannelRange(yChannel).minValue,
            max: state.value.getChannelRange(yChannel).maxValue,
            step: yChannelStep,
            'aria-roledescription': ariaRoleDescription,
            'aria-valuetext': getAriaValueTextForChannel(yChannel),
            'aria-orientation': 'vertical',
            'aria-describedby': props['aria-describedby'],
            'aria-details': props['aria-details'],
            disabled: isDisabled,
            value: state.value.getChannelValue(yChannel),
            name: yName,
            tabIndex: isMobile || focusedInput === 'y' ? undefined : -1,
            /*
        So that only a single "2d slider" control shows up when listing form elements for screen readers,
        add aria-hidden="true" to the unfocused input when the value has not changed via the keyboard,
        but remove aria-hidden to reveal the input for each channel when the value has changed with the keyboard.
      */ 'aria-hidden': isMobile || focusedInput === 'y' || valueChangedViaKeyboard ? undefined : 'true',
            onChange: onChange
        }
    };
}


export {$60bd7d6e45dcddfa$export$2f92a7a615a014f6 as useColorArea};
//# sourceMappingURL=useColorArea.module.js.map
