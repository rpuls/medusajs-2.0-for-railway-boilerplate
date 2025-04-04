var $6acf696f746f932c$exports = require("./utils.main.js");
var $7ff3f66df3873a5e$exports = require("./intlStrings.main.js");
var $gDW2h$react = require("react");
var $gDW2h$reactariainteractions = require("@react-aria/interactions");
var $gDW2h$reactariautils = require("@react-aria/utils");
var $gDW2h$reactariai18n = require("@react-aria/i18n");
var $gDW2h$reactariavisuallyhidden = require("@react-aria/visually-hidden");


function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}

function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "useTableColumnResize", () => $16d645f9e2153641$export$52994e973806c219);
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






function $16d645f9e2153641$export$52994e973806c219(props, state, ref) {
    let { column: item, triggerRef: triggerRef, isDisabled: isDisabled, onResizeStart: onResizeStart, onResize: onResize, onResizeEnd: onResizeEnd, 'aria-label': ariaLabel } = props;
    const stringFormatter = (0, $gDW2h$reactariai18n.useLocalizedStringFormatter)((0, ($parcel$interopDefault($7ff3f66df3873a5e$exports))), '@react-aria/table');
    let id = (0, $gDW2h$reactariautils.useId)();
    let isResizing = state.resizingColumn === item.key;
    let isResizingRef = (0, $gDW2h$react.useRef)(isResizing);
    let lastSize = (0, $gDW2h$react.useRef)(null);
    let wasFocusedOnResizeStart = (0, $gDW2h$react.useRef)(false);
    let editModeEnabled = state.tableState.isKeyboardNavigationDisabled;
    let { direction: direction } = (0, $gDW2h$reactariai18n.useLocale)();
    let { keyboardProps: keyboardProps } = (0, $gDW2h$reactariainteractions.useKeyboard)({
        onKeyDown: (e)=>{
            if (editModeEnabled) {
                if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ' || e.key === 'Tab') {
                    e.preventDefault();
                    endResize(item);
                }
            } else {
                // Continue propagation on keydown events so they still bubbles to useSelectableCollection and are handled there
                e.continuePropagation();
                if (e.key === 'Enter') startResize(item);
            }
        }
    });
    let startResize = (0, $gDW2h$reactariautils.useEffectEvent)((item)=>{
        if (!isResizingRef.current) {
            lastSize.current = state.updateResizedColumns(item.key, state.getColumnWidth(item.key));
            state.startResize(item.key);
            state.tableState.setKeyboardNavigationDisabled(true);
            onResizeStart === null || onResizeStart === void 0 ? void 0 : onResizeStart(lastSize.current);
        }
        isResizingRef.current = true;
    });
    let resize = (0, $gDW2h$reactariautils.useEffectEvent)((item, newWidth)=>{
        let sizes = state.updateResizedColumns(item.key, newWidth);
        onResize === null || onResize === void 0 ? void 0 : onResize(sizes);
        lastSize.current = sizes;
    });
    let endResize = (0, $gDW2h$reactariautils.useEffectEvent)((item)=>{
        if (isResizingRef.current) {
            if (lastSize.current == null) lastSize.current = state.updateResizedColumns(item.key, state.getColumnWidth(item.key));
            state.endResize();
            state.tableState.setKeyboardNavigationDisabled(false);
            onResizeEnd === null || onResizeEnd === void 0 ? void 0 : onResizeEnd(lastSize.current);
            isResizingRef.current = false;
            if ((triggerRef === null || triggerRef === void 0 ? void 0 : triggerRef.current) && !wasFocusedOnResizeStart.current) // switch focus back to the column header unless the resizer was already focused when resizing started.
            (0, $gDW2h$reactariainteractions.focusSafely)(triggerRef.current);
        }
        lastSize.current = null;
    });
    const columnResizeWidthRef = (0, $gDW2h$react.useRef)(0);
    const { moveProps: moveProps } = (0, $gDW2h$reactariainteractions.useMove)({
        onMoveStart () {
            columnResizeWidthRef.current = state.getColumnWidth(item.key);
            startResize(item);
        },
        onMove (e) {
            let { deltaX: deltaX, deltaY: deltaY, pointerType: pointerType } = e;
            if (direction === 'rtl') deltaX *= -1;
            if (pointerType === 'keyboard') {
                if (deltaY !== 0 && deltaX === 0) deltaX = deltaY * -1;
                deltaX *= 10;
            }
            // if moving up/down only, no need to resize
            if (deltaX !== 0) {
                columnResizeWidthRef.current += deltaX;
                resize(item, columnResizeWidthRef.current);
            }
        },
        onMoveEnd (e) {
            let { pointerType: pointerType } = e;
            columnResizeWidthRef.current = 0;
            if (pointerType === 'mouse' || pointerType === 'touch' && wasFocusedOnResizeStart.current) endResize(item);
        }
    });
    let onKeyDown = (0, $gDW2h$react.useCallback)((e)=>{
        var _moveProps_onKeyDown;
        if (editModeEnabled) (_moveProps_onKeyDown = moveProps.onKeyDown) === null || _moveProps_onKeyDown === void 0 ? void 0 : _moveProps_onKeyDown.call(moveProps, e);
    }, [
        editModeEnabled,
        moveProps
    ]);
    let min = Math.floor(state.getColumnMinWidth(item.key));
    let max = Math.floor(state.getColumnMaxWidth(item.key));
    if (max === Infinity) max = Number.MAX_SAFE_INTEGER;
    let value = Math.floor(state.getColumnWidth(item.key));
    let modality = (0, $gDW2h$reactariainteractions.useInteractionModality)();
    if (modality === 'virtual' && typeof window !== 'undefined' && 'ontouchstart' in window) modality = 'touch';
    let description = (triggerRef === null || triggerRef === void 0 ? void 0 : triggerRef.current) == null && (modality === 'keyboard' || modality === 'virtual') && !isResizing ? stringFormatter.format('resizerDescription') : undefined;
    let descriptionProps = (0, $gDW2h$reactariautils.useDescription)(description);
    let ariaProps = {
        'aria-label': ariaLabel,
        'aria-orientation': 'horizontal',
        'aria-labelledby': `${id} ${(0, $6acf696f746f932c$exports.getColumnHeaderId)(state.tableState, item.key)}`,
        'aria-valuetext': stringFormatter.format('columnSize', {
            value: value
        }),
        'type': 'range',
        min: min,
        max: max,
        value: value,
        ...descriptionProps
    };
    const focusInput = (0, $gDW2h$react.useCallback)(()=>{
        if (ref.current) (0, $gDW2h$reactariainteractions.focusSafely)(ref.current);
    }, [
        ref
    ]);
    let resizingColumn = state.resizingColumn;
    let prevResizingColumn = (0, $gDW2h$react.useRef)(null);
    (0, $gDW2h$react.useEffect)(()=>{
        if (prevResizingColumn.current !== resizingColumn && resizingColumn != null && resizingColumn === item.key) {
            wasFocusedOnResizeStart.current = document.activeElement === ref.current;
            startResize(item);
            // Delay focusing input until Android Chrome's delayed click after touchend happens: https://bugs.chromium.org/p/chromium/issues/detail?id=1150073
            let timeout = setTimeout(()=>focusInput(), 0);
            // VoiceOver on iOS has problems focusing the input from a menu.
            let VOTimeout = setTimeout(focusInput, 400);
            return ()=>{
                clearTimeout(timeout);
                clearTimeout(VOTimeout);
            };
        }
        prevResizingColumn.current = resizingColumn;
    }, [
        resizingColumn,
        item,
        focusInput,
        ref,
        startResize
    ]);
    let onChange = (e)=>{
        let currentWidth = state.getColumnWidth(item.key);
        let nextValue = parseFloat(e.target.value);
        if (nextValue > currentWidth) nextValue = currentWidth + 10;
        else nextValue = currentWidth - 10;
        resize(item, nextValue);
    };
    let { pressProps: pressProps } = (0, $gDW2h$reactariainteractions.usePress)({
        preventFocusOnPress: true,
        onPressStart: (e)=>{
            if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey || e.pointerType === 'keyboard') return;
            if (e.pointerType === 'virtual' && state.resizingColumn != null) {
                endResize(item);
                return;
            }
            // Sometimes onPress won't trigger for quick taps on mobile so we want to focus the input so blurring away
            // can cancel resize mode for us.
            focusInput();
            // If resizer is always visible, mobile screenreader user can access the visually hidden resizer directly and thus we don't need
            // to handle a virtual click to start the resizer.
            if (e.pointerType !== 'virtual') startResize(item);
        },
        onPress: (e)=>{
            if ((e.pointerType === 'touch' && wasFocusedOnResizeStart.current || e.pointerType === 'mouse') && state.resizingColumn != null) endResize(item);
        }
    });
    let { visuallyHiddenProps: visuallyHiddenProps } = (0, $gDW2h$reactariavisuallyhidden.useVisuallyHidden)();
    return {
        resizerProps: (0, $gDW2h$reactariautils.mergeProps)(keyboardProps, {
            ...moveProps,
            onKeyDown: onKeyDown
        }, pressProps, {
            style: {
                touchAction: 'none'
            }
        }),
        inputProps: (0, $gDW2h$reactariautils.mergeProps)(visuallyHiddenProps, {
            id: id,
            onBlur: ()=>{
                endResize(item);
            },
            onChange: onChange,
            disabled: isDisabled
        }, ariaProps),
        isResizing: isResizing
    };
}


//# sourceMappingURL=useTableColumnResize.main.js.map
