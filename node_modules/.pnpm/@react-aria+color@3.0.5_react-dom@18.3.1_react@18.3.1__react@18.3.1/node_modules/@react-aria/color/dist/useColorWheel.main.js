var $iWAp3$reactariautils = require("@react-aria/utils");
var $iWAp3$react = require("react");
var $iWAp3$reactariainteractions = require("@react-aria/interactions");
var $iWAp3$reactariai18n = require("@react-aria/i18n");
var $iWAp3$reactariavisuallyhidden = require("@react-aria/visually-hidden");


function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "useColorWheel", () => $1d29bf243d4a9a53$export$9064ff4e44b3729a);
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




function $1d29bf243d4a9a53$export$9064ff4e44b3729a(props, state, inputRef) {
    let { isDisabled: isDisabled, innerRadius: innerRadius, outerRadius: outerRadius, 'aria-label': ariaLabel, name: name } = props;
    let { addGlobalListener: addGlobalListener, removeGlobalListener: removeGlobalListener } = (0, $iWAp3$reactariautils.useGlobalListeners)();
    let thumbRadius = (innerRadius + outerRadius) / 2;
    let focusInput = (0, $iWAp3$react.useCallback)(()=>{
        if (inputRef.current) (0, $iWAp3$reactariautils.focusWithoutScrolling)(inputRef.current);
    }, [
        inputRef
    ]);
    (0, $iWAp3$reactariautils.useFormReset)(inputRef, state.hue, state.setHue);
    let currentPosition = (0, $iWAp3$react.useRef)(null);
    let { keyboardProps: keyboardProps } = (0, $iWAp3$reactariainteractions.useKeyboard)({
        onKeyDown (e) {
            // these are the cases that useMove doesn't handle
            if (!/^(PageUp|PageDown)$/.test(e.key)) {
                e.continuePropagation();
                return;
            }
            // same handling as useMove, don't need to stop propagation, useKeyboard will do that for us
            e.preventDefault();
            // remember to set this and unset it so that onChangeEnd is fired
            state.setDragging(true);
            switch(e.key){
                case 'PageUp':
                    e.preventDefault();
                    state.increment(state.pageStep);
                    break;
                case 'PageDown':
                    e.preventDefault();
                    state.decrement(state.pageStep);
                    break;
            }
            state.setDragging(false);
        }
    });
    let moveHandler = {
        onMoveStart () {
            currentPosition.current = null;
            state.setDragging(true);
        },
        onMove ({ deltaX: deltaX, deltaY: deltaY, pointerType: pointerType, shiftKey: shiftKey }) {
            if (currentPosition.current == null) currentPosition.current = state.getThumbPosition(thumbRadius);
            currentPosition.current.x += deltaX;
            currentPosition.current.y += deltaY;
            if (pointerType === 'keyboard') {
                if (deltaX > 0 || deltaY < 0) state.increment(shiftKey ? state.pageStep : state.step);
                else if (deltaX < 0 || deltaY > 0) state.decrement(shiftKey ? state.pageStep : state.step);
            } else state.setHueFromPoint(currentPosition.current.x, currentPosition.current.y, thumbRadius);
        },
        onMoveEnd () {
            isOnTrack.current = false;
            state.setDragging(false);
            focusInput();
        }
    };
    let { moveProps: movePropsThumb } = (0, $iWAp3$reactariainteractions.useMove)(moveHandler);
    let currentPointer = (0, $iWAp3$react.useRef)(undefined);
    let isOnTrack = (0, $iWAp3$react.useRef)(false);
    let { moveProps: movePropsContainer } = (0, $iWAp3$reactariainteractions.useMove)({
        onMoveStart () {
            if (isOnTrack.current) moveHandler.onMoveStart();
        },
        onMove (e) {
            if (isOnTrack.current) moveHandler.onMove(e);
        },
        onMoveEnd () {
            if (isOnTrack.current) moveHandler.onMoveEnd();
        }
    });
    let onThumbDown = (id)=>{
        if (!state.isDragging) {
            currentPointer.current = id;
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
            focusInput();
            state.setDragging(false);
            currentPointer.current = undefined;
            isOnTrack.current = false;
            if (typeof PointerEvent !== 'undefined') removeGlobalListener(window, 'pointerup', onThumbUp, false);
            else {
                removeGlobalListener(window, 'mouseup', onThumbUp, false);
                removeGlobalListener(window, 'touchend', onThumbUp, false);
            }
        }
    };
    let onTrackDown = (track, id, pageX, pageY)=>{
        let rect = track.getBoundingClientRect();
        let x = pageX - rect.x - rect.width / 2;
        let y = pageY - rect.y - rect.height / 2;
        let radius = Math.sqrt(x * x + y * y);
        if (innerRadius < radius && radius < outerRadius && !state.isDragging && currentPointer.current === undefined) {
            isOnTrack.current = true;
            currentPointer.current = id;
            state.setHueFromPoint(x, y, radius);
            focusInput();
            state.setDragging(true);
            if (typeof PointerEvent !== 'undefined') addGlobalListener(window, 'pointerup', onTrackUp, false);
            else {
                addGlobalListener(window, 'mouseup', onTrackUp, false);
                addGlobalListener(window, 'touchend', onTrackUp, false);
            }
        }
    };
    let onTrackUp = (e)=>{
        var _e_changedTouches;
        var _e_pointerId;
        let id = (_e_pointerId = e.pointerId) !== null && _e_pointerId !== void 0 ? _e_pointerId : (_e_changedTouches = e.changedTouches) === null || _e_changedTouches === void 0 ? void 0 : _e_changedTouches[0].identifier;
        if (isOnTrack.current && id === currentPointer.current) {
            isOnTrack.current = false;
            currentPointer.current = undefined;
            state.setDragging(false);
            focusInput();
            if (typeof PointerEvent !== 'undefined') removeGlobalListener(window, 'pointerup', onTrackUp, false);
            else {
                removeGlobalListener(window, 'mouseup', onTrackUp, false);
                removeGlobalListener(window, 'touchend', onTrackUp, false);
            }
        }
    };
    let trackInteractions = isDisabled ? {} : (0, $iWAp3$reactariautils.mergeProps)({
        ...typeof PointerEvent !== 'undefined' ? {
            onPointerDown: (e)=>{
                if (e.pointerType === 'mouse' && (e.button !== 0 || e.altKey || e.ctrlKey || e.metaKey)) return;
                onTrackDown(e.currentTarget, e.pointerId, e.clientX, e.clientY);
            }
        } : {
            onMouseDown: (e)=>{
                if (e.button !== 0 || e.altKey || e.ctrlKey || e.metaKey) return;
                onTrackDown(e.currentTarget, undefined, e.clientX, e.clientY);
            },
            onTouchStart: (e)=>{
                onTrackDown(e.currentTarget, e.changedTouches[0].identifier, e.changedTouches[0].clientX, e.changedTouches[0].clientY);
            }
        }
    }, movePropsContainer);
    let thumbInteractions = isDisabled ? {} : (0, $iWAp3$reactariautils.mergeProps)({
        onMouseDown: (e)=>{
            if (e.button !== 0 || e.altKey || e.ctrlKey || e.metaKey) return;
            onThumbDown(undefined);
        },
        onPointerDown: (e)=>{
            if (e.pointerType === 'mouse' && (e.button !== 0 || e.altKey || e.ctrlKey || e.metaKey)) return;
            onThumbDown(e.pointerId);
        },
        onTouchStart: (e)=>{
            onThumbDown(e.changedTouches[0].identifier);
        }
    }, keyboardProps, movePropsThumb);
    let { x: x, y: y } = state.getThumbPosition(thumbRadius);
    // Provide a default aria-label if none is given
    let { locale: locale } = (0, $iWAp3$reactariai18n.useLocale)();
    if (ariaLabel == null && props['aria-labelledby'] == null) ariaLabel = state.value.getChannelName('hue', locale);
    let inputLabellingProps = (0, $iWAp3$reactariautils.useLabels)({
        ...props,
        'aria-label': ariaLabel
    });
    let { minValue: minValue, maxValue: maxValue, step: step } = state.value.getChannelRange('hue');
    let forcedColorAdjustNoneStyle = {
        forcedColorAdjust: 'none'
    };
    let { visuallyHiddenProps: visuallyHiddenProps } = (0, $iWAp3$reactariavisuallyhidden.useVisuallyHidden)({
        style: {
            opacity: '0.0001',
            width: '100%',
            height: '100%',
            pointerEvents: 'none'
        }
    });
    return {
        trackProps: {
            ...trackInteractions,
            style: {
                position: 'relative',
                touchAction: 'none',
                width: outerRadius * 2,
                height: outerRadius * 2,
                background: `
          conic-gradient(
            from 90deg,
            hsl(0, 100%, 50%),
            hsl(30, 100%, 50%),
            hsl(60, 100%, 50%),
            hsl(90, 100%, 50%),
            hsl(120, 100%, 50%),
            hsl(150, 100%, 50%),
            hsl(180, 100%, 50%),
            hsl(210, 100%, 50%),
            hsl(240, 100%, 50%),
            hsl(270, 100%, 50%),
            hsl(300, 100%, 50%),
            hsl(330, 100%, 50%),
            hsl(360, 100%, 50%)
          )
        `,
                clipPath: `path(evenodd, "${$1d29bf243d4a9a53$var$circlePath(outerRadius, outerRadius, outerRadius)} ${$1d29bf243d4a9a53$var$circlePath(outerRadius, outerRadius, innerRadius)}")`,
                ...forcedColorAdjustNoneStyle
            }
        },
        thumbProps: {
            ...thumbInteractions,
            style: {
                position: 'absolute',
                left: outerRadius + x,
                top: outerRadius + y,
                transform: 'translate(-50%, -50%)',
                touchAction: 'none',
                ...forcedColorAdjustNoneStyle
            }
        },
        inputProps: (0, $iWAp3$reactariautils.mergeProps)(inputLabellingProps, {
            type: 'range',
            min: String(minValue),
            max: String(maxValue),
            step: String(step),
            'aria-valuetext': `${state.value.formatChannelValue('hue', locale)}, ${state.value.getHueName(locale)}`,
            disabled: isDisabled,
            value: `${state.value.getChannelValue('hue')}`,
            name: name,
            onChange: (e)=>{
                state.setHue(parseFloat(e.target.value));
            },
            style: visuallyHiddenProps.style,
            'aria-errormessage': props['aria-errormessage'],
            'aria-describedby': props['aria-describedby'],
            'aria-details': props['aria-details']
        })
    };
}
// Creates an SVG path string for a circle.
function $1d29bf243d4a9a53$var$circlePath(cx, cy, r) {
    return `M ${cx}, ${cy} m ${-r}, 0 a ${r}, ${r}, 0, 1, 0, ${r * 2}, 0 a ${r}, ${r}, 0, 1, 0 ${-r * 2}, 0`;
}


//# sourceMappingURL=useColorWheel.main.js.map
