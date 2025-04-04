var $28e10663603f5ea1$exports = require("./DragManager.main.js");
var $76b1e110a27b1ccd$exports = require("./constants.main.js");
var $4620ae0dc40f0031$exports = require("./utils.main.js");
var $7c8adf3925a26206$exports = require("./intlStrings.main.js");
var $3w36N$react = require("react");
var $3w36N$reactariautils = require("@react-aria/utils");
var $3w36N$reactariai18n = require("@react-aria/i18n");


function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}

function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "useDrag", () => $dc204e8ec58447a6$export$7941f8aafa4b6021);
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






const $dc204e8ec58447a6$var$MESSAGES = {
    keyboard: {
        start: 'dragDescriptionKeyboard',
        end: 'endDragKeyboard'
    },
    touch: {
        start: 'dragDescriptionTouch',
        end: 'endDragTouch'
    },
    virtual: {
        start: 'dragDescriptionVirtual',
        end: 'endDragVirtual'
    }
};
function $dc204e8ec58447a6$export$7941f8aafa4b6021(options) {
    let { hasDragButton: hasDragButton, isDisabled: isDisabled } = options;
    let stringFormatter = (0, $3w36N$reactariai18n.useLocalizedStringFormatter)((0, ($parcel$interopDefault($7c8adf3925a26206$exports))), '@react-aria/dnd');
    let state = (0, $3w36N$react.useRef)({
        options: options,
        x: 0,
        y: 0
    }).current;
    state.options = options;
    let isDraggingRef = (0, $3w36N$react.useRef)(false);
    let [isDragging, setDraggingState] = (0, $3w36N$react.useState)(false);
    let setDragging = (isDragging)=>{
        isDraggingRef.current = isDragging;
        setDraggingState(isDragging);
    };
    let { addGlobalListener: addGlobalListener, removeAllGlobalListeners: removeAllGlobalListeners } = (0, $3w36N$reactariautils.useGlobalListeners)();
    let modalityOnPointerDown = (0, $3w36N$react.useRef)(null);
    let onDragStart = (e)=>{
        var _options_preview;
        if (e.defaultPrevented) return;
        // Prevent the drag event from propagating to any parent draggables
        e.stopPropagation();
        // If this drag was initiated by a mobile screen reader (e.g. VoiceOver or TalkBack), enter virtual dragging mode.
        if (modalityOnPointerDown.current === 'virtual') {
            e.preventDefault();
            startDragging(e.target);
            modalityOnPointerDown.current = null;
            return;
        }
        if (typeof options.onDragStart === 'function') options.onDragStart({
            type: 'dragstart',
            x: e.clientX,
            y: e.clientY
        });
        let items = options.getItems();
        (0, $4620ae0dc40f0031$exports.writeToDataTransfer)(e.dataTransfer, items);
        let allowed = (0, $76b1e110a27b1ccd$exports.DROP_OPERATION).all;
        if (typeof options.getAllowedDropOperations === 'function') {
            let allowedOperations = options.getAllowedDropOperations();
            allowed = (0, $76b1e110a27b1ccd$exports.DROP_OPERATION).none;
            for (let operation of allowedOperations)allowed |= (0, $76b1e110a27b1ccd$exports.DROP_OPERATION)[operation] || (0, $76b1e110a27b1ccd$exports.DROP_OPERATION).none;
        }
        (0, $4620ae0dc40f0031$exports.setGlobalAllowedDropOperations)(allowed);
        e.dataTransfer.effectAllowed = (0, $76b1e110a27b1ccd$exports.EFFECT_ALLOWED)[allowed] || 'none';
        // If there is a preview option, use it to render a custom preview image that will
        // appear under the pointer while dragging. If not, the element itself is dragged by the browser.
        if (typeof ((_options_preview = options.preview) === null || _options_preview === void 0 ? void 0 : _options_preview.current) === 'function') options.preview.current(items, (node)=>{
            if (!node) return;
            // Compute the offset that the preview will appear under the mouse.
            // If possible, this is based on the point the user clicked on the target.
            // If the preview is much smaller, then just use the center point of the preview.
            let size = node.getBoundingClientRect();
            let rect = e.currentTarget.getBoundingClientRect();
            let x = e.clientX - rect.x;
            let y = e.clientY - rect.y;
            if (x > size.width || y > size.height) {
                x = size.width / 2;
                y = size.height / 2;
            }
            // Rounding height to an even number prevents blurry preview seen on some screens
            let height = 2 * Math.round(size.height / 2);
            node.style.height = `${height}px`;
            e.dataTransfer.setDragImage(node, x, y);
        });
        // Enforce that drops are handled by useDrop.
        addGlobalListener(window, 'drop', (e)=>{
            e.preventDefault();
            e.stopPropagation();
            console.warn('Drags initiated from the React Aria useDrag hook may only be dropped on a target created with useDrop. This ensures that a keyboard and screen reader accessible alternative is available.');
        }, {
            once: true
        });
        state.x = e.clientX;
        state.y = e.clientY;
        // Wait a frame before we set dragging to true so that the browser has time to
        // render the preview image before we update the element that has been dragged.
        requestAnimationFrame(()=>{
            setDragging(true);
        });
    };
    let onDrag = (e)=>{
        // Prevent the drag event from propagating to any parent draggables
        e.stopPropagation();
        if (e.clientX === state.x && e.clientY === state.y) return;
        if (typeof options.onDragMove === 'function') options.onDragMove({
            type: 'dragmove',
            x: e.clientX,
            y: e.clientY
        });
        state.x = e.clientX;
        state.y = e.clientY;
    };
    let onDragEnd = (e)=>{
        // Prevent the drag event from propagating to any parent draggables
        e.stopPropagation();
        if (typeof options.onDragEnd === 'function') {
            let event = {
                type: 'dragend',
                x: e.clientX,
                y: e.clientY,
                dropOperation: (0, $76b1e110a27b1ccd$exports.DROP_EFFECT_TO_DROP_OPERATION)[e.dataTransfer.dropEffect]
            };
            // Chrome Android always returns none as its dropEffect so we use the drop effect set in useDrop via
            // onDragEnter/onDragOver instead. https://bugs.chromium.org/p/chromium/issues/detail?id=1353951
            if (0, $4620ae0dc40f0031$exports.globalDropEffect) event.dropOperation = (0, $76b1e110a27b1ccd$exports.DROP_EFFECT_TO_DROP_OPERATION)[0, $4620ae0dc40f0031$exports.globalDropEffect];
            options.onDragEnd(event);
        }
        setDragging(false);
        removeAllGlobalListeners();
        (0, $4620ae0dc40f0031$exports.setGlobalAllowedDropOperations)((0, $76b1e110a27b1ccd$exports.DROP_OPERATION).none);
        (0, $4620ae0dc40f0031$exports.setGlobalDropEffect)(undefined);
    };
    // If the dragged element is removed from the DOM via onDrop, onDragEnd won't fire: https://bugzilla.mozilla.org/show_bug.cgi?id=460801
    // In this case, we need to manually call onDragEnd on cleanup
    (0, $3w36N$reactariautils.useLayoutEffect)(()=>{
        return ()=>{
            if (isDraggingRef.current) {
                if (typeof state.options.onDragEnd === 'function') {
                    let event = {
                        type: 'dragend',
                        x: 0,
                        y: 0,
                        dropOperation: (0, $76b1e110a27b1ccd$exports.DROP_EFFECT_TO_DROP_OPERATION)[(0, $4620ae0dc40f0031$exports.globalDropEffect) || 'none']
                    };
                    state.options.onDragEnd(event);
                }
                setDragging(false);
                (0, $4620ae0dc40f0031$exports.setGlobalAllowedDropOperations)((0, $76b1e110a27b1ccd$exports.DROP_OPERATION).none);
                (0, $4620ae0dc40f0031$exports.setGlobalDropEffect)(undefined);
            }
        };
    }, [
        state
    ]);
    let onPress = (e)=>{
        if (e.pointerType !== 'keyboard' && e.pointerType !== 'virtual') return;
        startDragging(e.target);
    };
    let startDragging = (target)=>{
        if (typeof state.options.onDragStart === 'function') {
            let rect = target.getBoundingClientRect();
            state.options.onDragStart({
                type: 'dragstart',
                x: rect.x + rect.width / 2,
                y: rect.y + rect.height / 2
            });
        }
        $28e10663603f5ea1$exports.beginDragging({
            element: target,
            items: state.options.getItems(),
            allowedDropOperations: typeof state.options.getAllowedDropOperations === 'function' ? state.options.getAllowedDropOperations() : [
                'move',
                'copy',
                'link'
            ],
            onDragEnd (e) {
                setDragging(false);
                if (typeof state.options.onDragEnd === 'function') state.options.onDragEnd(e);
            }
        }, stringFormatter);
        setDragging(true);
    };
    let modality = (0, $4620ae0dc40f0031$exports.useDragModality)();
    let message = !isDragging ? $dc204e8ec58447a6$var$MESSAGES[modality].start : $dc204e8ec58447a6$var$MESSAGES[modality].end;
    let descriptionProps = (0, $3w36N$reactariautils.useDescription)(stringFormatter.format(message));
    let interactions = {};
    if (!hasDragButton) // If there's no separate button to trigger accessible drag and drop mode,
    // then add event handlers to the draggable element itself to start dragging.
    // For keyboard, we use the Enter key in a capturing listener to prevent other
    // events such as selection from also occurring. We attempt to infer whether a
    // pointer event (e.g. long press) came from a touch screen reader, and then initiate
    // dragging in the native onDragStart listener above.
    interactions = {
        ...descriptionProps,
        onPointerDown (e) {
            modalityOnPointerDown.current = (0, $3w36N$reactariautils.isVirtualPointerEvent)(e.nativeEvent) ? 'virtual' : e.pointerType;
            // Try to detect virtual drag passthrough gestures.
            if (e.width < 1 && e.height < 1) // iOS VoiceOver.
            modalityOnPointerDown.current = 'virtual';
            else {
                let rect = e.currentTarget.getBoundingClientRect();
                let offsetX = e.clientX - rect.x;
                let offsetY = e.clientY - rect.y;
                let centerX = rect.width / 2;
                let centerY = rect.height / 2;
                if (Math.abs(offsetX - centerX) <= 0.5 && Math.abs(offsetY - centerY) <= 0.5) // Android TalkBack.
                modalityOnPointerDown.current = 'virtual';
                else modalityOnPointerDown.current = e.pointerType;
            }
        },
        onKeyDownCapture (e) {
            if (e.target === e.currentTarget && e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
            }
        },
        onKeyUpCapture (e) {
            if (e.target === e.currentTarget && e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                startDragging(e.target);
            }
        },
        onClick (e) {
            // Handle NVDA/JAWS in browse mode, and touch screen readers. In this case, no keyboard events are fired.
            if ((0, $3w36N$reactariautils.isVirtualClick)(e.nativeEvent) || modalityOnPointerDown.current === 'virtual') {
                e.preventDefault();
                e.stopPropagation();
                startDragging(e.target);
            }
        }
    };
    if (isDisabled) return {
        dragProps: {
            draggable: 'false'
        },
        dragButtonProps: {},
        isDragging: false
    };
    return {
        dragProps: {
            ...interactions,
            draggable: 'true',
            onDragStart: onDragStart,
            onDrag: onDrag,
            onDragEnd: onDragEnd
        },
        dragButtonProps: {
            ...descriptionProps,
            onPress: onPress
        },
        isDragging: isDragging
    };
}


//# sourceMappingURL=useDrag.main.js.map
