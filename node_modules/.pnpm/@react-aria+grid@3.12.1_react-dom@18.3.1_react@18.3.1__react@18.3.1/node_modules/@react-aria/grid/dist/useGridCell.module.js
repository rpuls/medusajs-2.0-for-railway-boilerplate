import {gridMap as $1af922eb41e03c8f$export$e6235c0d09b995d0} from "./utils.module.js";
import {focusSafely as $j4Qbl$focusSafely, isFocusVisible as $j4Qbl$isFocusVisible} from "@react-aria/interactions";
import {getFocusableTreeWalker as $j4Qbl$getFocusableTreeWalker} from "@react-aria/focus";
import {scrollIntoViewport as $j4Qbl$scrollIntoViewport, getScrollParent as $j4Qbl$getScrollParent, mergeProps as $j4Qbl$mergeProps} from "@react-aria/utils";
import {useRef as $j4Qbl$useRef} from "react";
import {useLocale as $j4Qbl$useLocale} from "@react-aria/i18n";
import {useSelectableItem as $j4Qbl$useSelectableItem} from "@react-aria/selection";

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






function $ab90dcbc1b5466d0$export$c7e10bfc0c59f67c(props, state, ref) {
    let { node: node, isVirtualized: isVirtualized, focusMode: focusMode = 'child', shouldSelectOnPressUp: shouldSelectOnPressUp, onAction: onAction } = props;
    let { direction: direction } = (0, $j4Qbl$useLocale)();
    let { keyboardDelegate: keyboardDelegate, actions: { onCellAction: onCellAction } } = (0, $1af922eb41e03c8f$export$e6235c0d09b995d0).get(state);
    // We need to track the key of the item at the time it was last focused so that we force
    // focus to go to the item when the DOM node is reused for a different item in a virtualizer.
    let keyWhenFocused = (0, $j4Qbl$useRef)(null);
    // Handles focusing the cell. If there is a focusable child,
    // it is focused, otherwise the cell itself is focused.
    let focus = ()=>{
        if (ref.current) {
            let treeWalker = (0, $j4Qbl$getFocusableTreeWalker)(ref.current);
            if (focusMode === 'child') {
                // If focus is already on a focusable child within the cell, early return so we don't shift focus
                if (ref.current.contains(document.activeElement) && ref.current !== document.activeElement) return;
                let focusable = state.selectionManager.childFocusStrategy === 'last' ? $ab90dcbc1b5466d0$var$last(treeWalker) : treeWalker.firstChild();
                if (focusable) {
                    (0, $j4Qbl$focusSafely)(focusable);
                    return;
                }
            }
            if (keyWhenFocused.current != null && node.key !== keyWhenFocused.current || !ref.current.contains(document.activeElement)) (0, $j4Qbl$focusSafely)(ref.current);
        }
    };
    let { itemProps: itemProps, isPressed: isPressed } = (0, $j4Qbl$useSelectableItem)({
        selectionManager: state.selectionManager,
        key: node.key,
        ref: ref,
        isVirtualized: isVirtualized,
        focus: focus,
        shouldSelectOnPressUp: shouldSelectOnPressUp,
        onAction: onCellAction ? ()=>onCellAction(node.key) : onAction,
        isDisabled: state.collection.size === 0
    });
    let onKeyDownCapture = (e)=>{
        if (!e.currentTarget.contains(e.target) || state.isKeyboardNavigationDisabled || !ref.current || !document.activeElement) return;
        let walker = (0, $j4Qbl$getFocusableTreeWalker)(ref.current);
        walker.currentNode = document.activeElement;
        switch(e.key){
            case 'ArrowLeft':
                {
                    // Find the next focusable element within the cell.
                    let focusable = direction === 'rtl' ? walker.nextNode() : walker.previousNode();
                    // Don't focus the cell itself if focusMode is "child"
                    if (focusMode === 'child' && focusable === ref.current) focusable = null;
                    e.preventDefault();
                    e.stopPropagation();
                    if (focusable) {
                        (0, $j4Qbl$focusSafely)(focusable);
                        (0, $j4Qbl$scrollIntoViewport)(focusable, {
                            containingElement: (0, $j4Qbl$getScrollParent)(ref.current)
                        });
                    } else {
                        var _keyboardDelegate_getKeyLeftOf;
                        // If there is no next focusable child, then move to the next cell to the left of this one.
                        // This will be handled by useSelectableCollection. However, if there is no cell to the left
                        // of this one, only one column, and the grid doesn't focus rows, then the next key will be the
                        // same as this one. In that case we need to handle focusing either the cell or the first/last
                        // child, depending on the focus mode.
                        let prev = (_keyboardDelegate_getKeyLeftOf = keyboardDelegate.getKeyLeftOf) === null || _keyboardDelegate_getKeyLeftOf === void 0 ? void 0 : _keyboardDelegate_getKeyLeftOf.call(keyboardDelegate, node.key);
                        if (prev !== node.key) {
                            var // We prevent the capturing event from reaching children of the cell, e.g. pickers.
                            // We want arrow keys to navigate to the next cell instead. We need to re-dispatch
                            // the event from a higher parent so it still bubbles and gets handled by useSelectableCollection.
                            _ref_current_parentElement;
                            (_ref_current_parentElement = ref.current.parentElement) === null || _ref_current_parentElement === void 0 ? void 0 : _ref_current_parentElement.dispatchEvent(new KeyboardEvent(e.nativeEvent.type, e.nativeEvent));
                            break;
                        }
                        if (focusMode === 'cell' && direction === 'rtl') {
                            (0, $j4Qbl$focusSafely)(ref.current);
                            (0, $j4Qbl$scrollIntoViewport)(ref.current, {
                                containingElement: (0, $j4Qbl$getScrollParent)(ref.current)
                            });
                        } else {
                            walker.currentNode = ref.current;
                            focusable = direction === 'rtl' ? walker.firstChild() : $ab90dcbc1b5466d0$var$last(walker);
                            if (focusable) {
                                (0, $j4Qbl$focusSafely)(focusable);
                                (0, $j4Qbl$scrollIntoViewport)(focusable, {
                                    containingElement: (0, $j4Qbl$getScrollParent)(ref.current)
                                });
                            }
                        }
                    }
                    break;
                }
            case 'ArrowRight':
                {
                    let focusable = direction === 'rtl' ? walker.previousNode() : walker.nextNode();
                    if (focusMode === 'child' && focusable === ref.current) focusable = null;
                    e.preventDefault();
                    e.stopPropagation();
                    if (focusable) {
                        (0, $j4Qbl$focusSafely)(focusable);
                        (0, $j4Qbl$scrollIntoViewport)(focusable, {
                            containingElement: (0, $j4Qbl$getScrollParent)(ref.current)
                        });
                    } else {
                        var _keyboardDelegate_getKeyRightOf;
                        let next = (_keyboardDelegate_getKeyRightOf = keyboardDelegate.getKeyRightOf) === null || _keyboardDelegate_getKeyRightOf === void 0 ? void 0 : _keyboardDelegate_getKeyRightOf.call(keyboardDelegate, node.key);
                        if (next !== node.key) {
                            var // We prevent the capturing event from reaching children of the cell, e.g. pickers.
                            // We want arrow keys to navigate to the next cell instead. We need to re-dispatch
                            // the event from a higher parent so it still bubbles and gets handled by useSelectableCollection.
                            _ref_current_parentElement1;
                            (_ref_current_parentElement1 = ref.current.parentElement) === null || _ref_current_parentElement1 === void 0 ? void 0 : _ref_current_parentElement1.dispatchEvent(new KeyboardEvent(e.nativeEvent.type, e.nativeEvent));
                            break;
                        }
                        if (focusMode === 'cell' && direction === 'ltr') {
                            (0, $j4Qbl$focusSafely)(ref.current);
                            (0, $j4Qbl$scrollIntoViewport)(ref.current, {
                                containingElement: (0, $j4Qbl$getScrollParent)(ref.current)
                            });
                        } else {
                            walker.currentNode = ref.current;
                            focusable = direction === 'rtl' ? $ab90dcbc1b5466d0$var$last(walker) : walker.firstChild();
                            if (focusable) {
                                (0, $j4Qbl$focusSafely)(focusable);
                                (0, $j4Qbl$scrollIntoViewport)(focusable, {
                                    containingElement: (0, $j4Qbl$getScrollParent)(ref.current)
                                });
                            }
                        }
                    }
                    break;
                }
            case 'ArrowUp':
            case 'ArrowDown':
                // Prevent this event from reaching cell children, e.g. menu buttons. We want arrow keys to navigate
                // to the cell above/below instead. We need to re-dispatch the event from a higher parent so it still
                // bubbles and gets handled by useSelectableCollection.
                if (!e.altKey && ref.current.contains(e.target)) {
                    var _ref_current_parentElement2;
                    e.stopPropagation();
                    e.preventDefault();
                    (_ref_current_parentElement2 = ref.current.parentElement) === null || _ref_current_parentElement2 === void 0 ? void 0 : _ref_current_parentElement2.dispatchEvent(new KeyboardEvent(e.nativeEvent.type, e.nativeEvent));
                }
                break;
        }
    };
    // Grid cells can have focusable elements inside them. In this case, focus should
    // be marshalled to that element rather than focusing the cell itself.
    let onFocus = (e)=>{
        keyWhenFocused.current = node.key;
        if (e.target !== ref.current) {
            // useSelectableItem only handles setting the focused key when
            // the focused element is the gridcell itself. We also want to
            // set the focused key when a child element receives focus.
            // If focus is currently visible (e.g. the user is navigating with the keyboard),
            // then skip this. We want to restore focus to the previously focused row/cell
            // in that case since the table should act like a single tab stop.
            if (!(0, $j4Qbl$isFocusVisible)()) state.selectionManager.setFocusedKey(node.key);
            return;
        }
        // If the cell itself is focused, wait a frame so that focus finishes propagatating
        // up to the tree, and move focus to a focusable child if possible.
        requestAnimationFrame(()=>{
            if (focusMode === 'child' && document.activeElement === ref.current) focus();
        });
    };
    let gridCellProps = (0, $j4Qbl$mergeProps)(itemProps, {
        role: 'gridcell',
        onKeyDownCapture: onKeyDownCapture,
        'aria-colspan': node.colSpan,
        'aria-colindex': node.colIndex != null ? node.colIndex + 1 : undefined,
        colSpan: isVirtualized ? undefined : node.colSpan,
        onFocus: onFocus
    });
    var _node_colIndex;
    if (isVirtualized) gridCellProps['aria-colindex'] = ((_node_colIndex = node.colIndex) !== null && _node_colIndex !== void 0 ? _node_colIndex : node.index) + 1; // aria-colindex is 1-based
    // When pressing with a pointer and cell selection is not enabled, usePress will be applied to the
    // row rather than the cell. However, when the row is draggable, usePress cannot preventDefault
    // on pointer down, so the browser will try to focus the cell which has a tabIndex applied.
    // To avoid this, remove the tabIndex from the cell briefly on pointer down.
    if (shouldSelectOnPressUp && gridCellProps.tabIndex != null && gridCellProps.onPointerDown == null) gridCellProps.onPointerDown = (e)=>{
        let el = e.currentTarget;
        let tabindex = el.getAttribute('tabindex');
        el.removeAttribute('tabindex');
        requestAnimationFrame(()=>{
            if (tabindex != null) el.setAttribute('tabindex', tabindex);
        });
    };
    return {
        gridCellProps: gridCellProps,
        isPressed: isPressed
    };
}
function $ab90dcbc1b5466d0$var$last(walker) {
    let next = null;
    let last = null;
    do {
        last = walker.lastChild();
        if (last) next = last;
    }while (last);
    return next;
}


export {$ab90dcbc1b5466d0$export$c7e10bfc0c59f67c as useGridCell};
//# sourceMappingURL=useGridCell.module.js.map
