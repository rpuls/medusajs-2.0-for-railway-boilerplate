import {registerDropTarget as $67560de7c78cb232$export$c28d9fb4a54e471a} from "./DragManager.module.js";
import {DragTypes as $7252cd45fc48c07c$export$7f04ce188c91447c, globalAllowedDropOperations as $7252cd45fc48c07c$export$f0130eb70b6347b8, globalDndState as $7252cd45fc48c07c$export$6ca6700462636d0b, readFromDataTransfer as $7252cd45fc48c07c$export$d9e760437831f8b3, setGlobalDnDState as $7252cd45fc48c07c$export$6c10d32b362bfa5f, setGlobalDropEffect as $7252cd45fc48c07c$export$64f52ed7349ddb84} from "./utils.module.js";
import {DROP_EFFECT_TO_DROP_OPERATION as $103790afe9474d1c$export$608ecc6f1b23c35d, DROP_OPERATION as $103790afe9474d1c$export$60b7b4bcf3903d8e, DROP_OPERATION_ALLOWED as $103790afe9474d1c$export$9bbdfc78cf083e16, DROP_OPERATION_TO_DROP_EFFECT as $103790afe9474d1c$export$5eacb0769d26d3b2} from "./constants.module.js";
import {useVirtualDrop as $224594fe3e57ff1e$export$62447ad3d2ec7da6} from "./useVirtualDrop.module.js";
import {useState as $j5n4S$useState, useRef as $j5n4S$useRef} from "react";
import {useEffectEvent as $j5n4S$useEffectEvent, useLayoutEffect as $j5n4S$useLayoutEffect, isMac as $j5n4S$isMac, isIPad as $j5n4S$isIPad} from "@react-aria/utils";

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





const $5c06e4929e123553$var$DROP_ACTIVATE_TIMEOUT = 800;
function $5c06e4929e123553$export$ccdee5eaf73cf661(options) {
    let { hasDropButton: hasDropButton, isDisabled: isDisabled } = options;
    let [isDropTarget, setDropTarget] = (0, $j5n4S$useState)(false);
    let state = (0, $j5n4S$useRef)({
        x: 0,
        y: 0,
        dragOverElements: new Set(),
        dropEffect: 'none',
        allowedOperations: (0, $103790afe9474d1c$export$60b7b4bcf3903d8e).all,
        dropActivateTimer: undefined
    }).current;
    let fireDropEnter = (e)=>{
        setDropTarget(true);
        if (typeof options.onDropEnter === 'function') {
            let rect = e.currentTarget.getBoundingClientRect();
            options.onDropEnter({
                type: 'dropenter',
                x: e.clientX - rect.x,
                y: e.clientY - rect.y
            });
        }
    };
    let fireDropExit = (e)=>{
        setDropTarget(false);
        if (typeof options.onDropExit === 'function') {
            let rect = e.currentTarget.getBoundingClientRect();
            options.onDropExit({
                type: 'dropexit',
                x: e.clientX - rect.x,
                y: e.clientY - rect.y
            });
        }
    };
    let onDragOver = (e)=>{
        e.preventDefault();
        e.stopPropagation();
        let allowedOperations = $5c06e4929e123553$var$getAllowedOperations(e);
        if (e.clientX === state.x && e.clientY === state.y && allowedOperations === state.allowedOperations) {
            e.dataTransfer.dropEffect = state.dropEffect;
            return;
        }
        state.x = e.clientX;
        state.y = e.clientY;
        let prevDropEffect = state.dropEffect;
        // Update drop effect if allowed drop operations changed (e.g. user pressed modifier key).
        if (allowedOperations !== state.allowedOperations) {
            let allowedOps = $5c06e4929e123553$var$allowedOperationsToArray(allowedOperations);
            let dropOperation = allowedOps[0];
            if (typeof options.getDropOperation === 'function') {
                let types = new (0, $7252cd45fc48c07c$export$7f04ce188c91447c)(e.dataTransfer);
                dropOperation = $5c06e4929e123553$var$getDropOperation(allowedOperations, options.getDropOperation(types, allowedOps));
            }
            state.dropEffect = (0, $103790afe9474d1c$export$5eacb0769d26d3b2)[dropOperation] || 'none';
        }
        if (typeof options.getDropOperationForPoint === 'function') {
            let types = new (0, $7252cd45fc48c07c$export$7f04ce188c91447c)(e.dataTransfer);
            let rect = e.currentTarget.getBoundingClientRect();
            let dropOperation = $5c06e4929e123553$var$getDropOperation(allowedOperations, options.getDropOperationForPoint(types, $5c06e4929e123553$var$allowedOperationsToArray(allowedOperations), state.x - rect.x, state.y - rect.y));
            state.dropEffect = (0, $103790afe9474d1c$export$5eacb0769d26d3b2)[dropOperation] || 'none';
        }
        state.allowedOperations = allowedOperations;
        e.dataTransfer.dropEffect = state.dropEffect;
        // If the drop operation changes, update state and fire events appropriately.
        if (state.dropEffect === 'none' && prevDropEffect !== 'none') fireDropExit(e);
        else if (state.dropEffect !== 'none' && prevDropEffect === 'none') fireDropEnter(e);
        if (typeof options.onDropMove === 'function' && state.dropEffect !== 'none') {
            let rect = e.currentTarget.getBoundingClientRect();
            options.onDropMove({
                type: 'dropmove',
                x: state.x - rect.x,
                y: state.y - rect.y
            });
        }
        clearTimeout(state.dropActivateTimer);
        if (options.onDropActivate && typeof options.onDropActivate === 'function' && state.dropEffect !== 'none') {
            let onDropActivateOptions = options.onDropActivate;
            let rect = e.currentTarget.getBoundingClientRect();
            state.dropActivateTimer = setTimeout(()=>{
                onDropActivateOptions({
                    type: 'dropactivate',
                    x: state.x - rect.x,
                    y: state.y - rect.y
                });
            }, $5c06e4929e123553$var$DROP_ACTIVATE_TIMEOUT);
        }
    };
    let onDragEnter = (e)=>{
        e.preventDefault();
        e.stopPropagation();
        state.dragOverElements.add(e.target);
        if (state.dragOverElements.size > 1) return;
        let allowedOperationsBits = $5c06e4929e123553$var$getAllowedOperations(e);
        let allowedOperations = $5c06e4929e123553$var$allowedOperationsToArray(allowedOperationsBits);
        let dropOperation = allowedOperations[0];
        if (typeof options.getDropOperation === 'function') {
            let types = new (0, $7252cd45fc48c07c$export$7f04ce188c91447c)(e.dataTransfer);
            dropOperation = $5c06e4929e123553$var$getDropOperation(allowedOperationsBits, options.getDropOperation(types, allowedOperations));
        }
        if (typeof options.getDropOperationForPoint === 'function') {
            let types = new (0, $7252cd45fc48c07c$export$7f04ce188c91447c)(e.dataTransfer);
            let rect = e.currentTarget.getBoundingClientRect();
            dropOperation = $5c06e4929e123553$var$getDropOperation(allowedOperationsBits, options.getDropOperationForPoint(types, allowedOperations, e.clientX - rect.x, e.clientY - rect.y));
        }
        state.x = e.clientX;
        state.y = e.clientY;
        state.allowedOperations = allowedOperationsBits;
        state.dropEffect = (0, $103790afe9474d1c$export$5eacb0769d26d3b2)[dropOperation] || 'none';
        e.dataTransfer.dropEffect = state.dropEffect;
        if (dropOperation !== 'cancel') fireDropEnter(e);
    };
    let onDragLeave = (e)=>{
        e.preventDefault();
        e.stopPropagation();
        // We would use e.relatedTarget to detect if the drag is still inside the drop target,
        // but it is always null in WebKit. https://bugs.webkit.org/show_bug.cgi?id=66547
        // Instead, we track all of the targets of dragenter events in a set, and remove them
        // in dragleave. When the set becomes empty, we've left the drop target completely.
        // We must also remove any elements that are no longer in the DOM, because dragleave
        // events will never be fired for these. This can happen, for example, with drop
        // indicators between items, which disappear when the drop target changes.
        state.dragOverElements.delete(e.target);
        for (let element of state.dragOverElements)if (!e.currentTarget.contains(element)) state.dragOverElements.delete(element);
        if (state.dragOverElements.size > 0) return;
        if (state.dropEffect !== 'none') fireDropExit(e);
        clearTimeout(state.dropActivateTimer);
    };
    let onDrop = (e)=>{
        e.preventDefault();
        e.stopPropagation();
        // Track drop effect in global state for Chrome Android. https://bugs.chromium.org/p/chromium/issues/detail?id=1353951
        // Android onDragEnd always returns "none" as its drop effect.
        (0, $7252cd45fc48c07c$export$64f52ed7349ddb84)(state.dropEffect);
        if (typeof options.onDrop === 'function') {
            let dropOperation = (0, $103790afe9474d1c$export$608ecc6f1b23c35d)[state.dropEffect];
            let items = (0, $7252cd45fc48c07c$export$d9e760437831f8b3)(e.dataTransfer);
            let rect = e.currentTarget.getBoundingClientRect();
            let event = {
                type: 'drop',
                x: e.clientX - rect.x,
                y: e.clientY - rect.y,
                items: items,
                dropOperation: dropOperation
            };
            options.onDrop(event);
        }
        let dndStateSnapshot = {
            ...(0, $7252cd45fc48c07c$export$6ca6700462636d0b)
        };
        state.dragOverElements.clear();
        fireDropExit(e);
        clearTimeout(state.dropActivateTimer);
        // If there wasn't a collection being tracked as a dragged collection, then we are in a case where a non RSP drag is dropped on a
        // RSP collection and thus we don't need to preserve the global drop effect
        if (dndStateSnapshot.draggingCollectionRef == null) (0, $7252cd45fc48c07c$export$64f52ed7349ddb84)(undefined);
        else // Otherwise we need to preserve the global dnd state for onDragEnd's isInternal check.
        // At the moment fireDropExit may clear dropCollectionRef (i.e. useDroppableCollection's provided onDropExit, required to clear dropCollectionRef when exiting a valid drop target)
        (0, $7252cd45fc48c07c$export$6c10d32b362bfa5f)(dndStateSnapshot);
    };
    let onDropEnter = (0, $j5n4S$useEffectEvent)((e)=>{
        if (typeof options.onDropEnter === 'function') options.onDropEnter(e);
    });
    let onDropExit = (0, $j5n4S$useEffectEvent)((e)=>{
        if (typeof options.onDropExit === 'function') options.onDropExit(e);
    });
    let onDropActivate = (0, $j5n4S$useEffectEvent)((e)=>{
        if (typeof options.onDropActivate === 'function') options.onDropActivate(e);
    });
    let onKeyboardDrop = (0, $j5n4S$useEffectEvent)((e)=>{
        if (typeof options.onDrop === 'function') options.onDrop(e);
    });
    let getDropOperationKeyboard = (0, $j5n4S$useEffectEvent)((types, allowedOperations)=>{
        if (options.getDropOperation) return options.getDropOperation(types, allowedOperations);
        return allowedOperations[0];
    });
    let { ref: ref } = options;
    (0, $j5n4S$useLayoutEffect)(()=>{
        if (isDisabled || !ref.current) return;
        return $67560de7c78cb232$export$c28d9fb4a54e471a({
            element: ref.current,
            getDropOperation: getDropOperationKeyboard,
            onDropEnter (e) {
                setDropTarget(true);
                onDropEnter(e);
            },
            onDropExit (e) {
                setDropTarget(false);
                onDropExit(e);
            },
            onDrop: onKeyboardDrop,
            onDropActivate: onDropActivate
        });
    }, [
        isDisabled,
        ref,
        getDropOperationKeyboard,
        onDropEnter,
        onDropExit,
        onKeyboardDrop,
        onDropActivate
    ]);
    let { dropProps: dropProps } = (0, $224594fe3e57ff1e$export$62447ad3d2ec7da6)();
    if (isDisabled) return {
        dropProps: {},
        dropButtonProps: {
            isDisabled: true
        },
        isDropTarget: false
    };
    return {
        dropProps: {
            ...!hasDropButton && dropProps,
            onDragEnter: onDragEnter,
            onDragOver: onDragOver,
            onDragLeave: onDragLeave,
            onDrop: onDrop
        },
        dropButtonProps: {
            ...hasDropButton && dropProps
        },
        isDropTarget: isDropTarget
    };
}
function $5c06e4929e123553$var$getAllowedOperations(e) {
    let allowedOperations = (0, $103790afe9474d1c$export$9bbdfc78cf083e16)[e.dataTransfer.effectAllowed];
    // WebKit always sets effectAllowed to "copyMove" on macOS, and "all" on iOS, regardless of what was
    // set during the dragstart event: https://bugs.webkit.org/show_bug.cgi?id=178058
    //
    // Android Chrome also sets effectAllowed to "copyMove" in all cases: https://bugs.chromium.org/p/chromium/issues/detail?id=1359182
    //
    // If the drag started within the page, we can use a global variable to get the real allowed operations.
    // This needs to be intersected with the actual effectAllowed, which may have been filtered based on modifier keys.
    // Unfortunately, this means that link operations do not work at all in Safari.
    if (0, $7252cd45fc48c07c$export$f0130eb70b6347b8) allowedOperations &= (0, $7252cd45fc48c07c$export$f0130eb70b6347b8);
    // Chrome and Safari on macOS will automatically filter effectAllowed when pressing modifier keys,
    // allowing the user to switch between move, link, and copy operations. Firefox on macOS and all
    // Windows browsers do not do this, so do it ourselves instead. The exact keys are platform dependent.
    // https://ux.stackexchange.com/questions/83748/what-are-the-most-common-modifier-keys-for-dragging-objects-with-a-mouse
    //
    // Note that none of these modifiers are ever set in WebKit due to a bug: https://bugs.webkit.org/show_bug.cgi?id=77465
    // However, Safari does update effectAllowed correctly, so we can just rely on that.
    let allowedModifiers = (0, $103790afe9474d1c$export$60b7b4bcf3903d8e).none;
    if ((0, $j5n4S$isMac)()) {
        if (e.altKey) allowedModifiers |= (0, $103790afe9474d1c$export$60b7b4bcf3903d8e).copy;
        // Chrome and Safari both use the Control key for link, even though Finder uses Command + Option.
        // iPadOS doesn't support link operations and will not fire the drop event at all if dropEffect is set to link.
        // https://bugs.webkit.org/show_bug.cgi?id=244701
        if (e.ctrlKey && !(0, $j5n4S$isIPad)()) allowedModifiers |= (0, $103790afe9474d1c$export$60b7b4bcf3903d8e).link;
        if (e.metaKey) allowedModifiers |= (0, $103790afe9474d1c$export$60b7b4bcf3903d8e).move;
    } else {
        if (e.altKey) allowedModifiers |= (0, $103790afe9474d1c$export$60b7b4bcf3903d8e).link;
        if (e.shiftKey) allowedModifiers |= (0, $103790afe9474d1c$export$60b7b4bcf3903d8e).move;
        if (e.ctrlKey) allowedModifiers |= (0, $103790afe9474d1c$export$60b7b4bcf3903d8e).copy;
    }
    if (allowedModifiers) return allowedOperations & allowedModifiers;
    return allowedOperations;
}
function $5c06e4929e123553$var$allowedOperationsToArray(allowedOperationsBits) {
    let allowedOperations = [];
    if (allowedOperationsBits & (0, $103790afe9474d1c$export$60b7b4bcf3903d8e).move) allowedOperations.push('move');
    if (allowedOperationsBits & (0, $103790afe9474d1c$export$60b7b4bcf3903d8e).copy) allowedOperations.push('copy');
    if (allowedOperationsBits & (0, $103790afe9474d1c$export$60b7b4bcf3903d8e).link) allowedOperations.push('link');
    return allowedOperations;
}
function $5c06e4929e123553$var$getDropOperation(allowedOperations, operation) {
    let op = (0, $103790afe9474d1c$export$60b7b4bcf3903d8e)[operation];
    return allowedOperations & op ? operation : 'cancel';
}


export {$5c06e4929e123553$export$ccdee5eaf73cf661 as useDrop};
//# sourceMappingURL=useDrop.module.js.map
