import {getDragModality as $7252cd45fc48c07c$export$1fb2158d224b542c, getTypes as $7252cd45fc48c07c$export$e1d41611756c6326} from "./utils.mjs";
import {announce as $irqIb$announce} from "@react-aria/live-announcer";
import {ariaHideOutside as $irqIb$ariaHideOutside} from "@react-aria/overlays";
import {isVirtualClick as $irqIb$isVirtualClick, isVirtualPointerEvent as $irqIb$isVirtualPointerEvent} from "@react-aria/utils";
import {useState as $irqIb$useState, useEffect as $irqIb$useEffect} from "react";

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




let $67560de7c78cb232$var$dropTargets = new Map();
let $67560de7c78cb232$var$dropItems = new Map();
let $67560de7c78cb232$var$dragSession = null;
let $67560de7c78cb232$var$subscriptions = new Set();
function $67560de7c78cb232$export$c28d9fb4a54e471a(target) {
    $67560de7c78cb232$var$dropTargets.set(target.element, target);
    $67560de7c78cb232$var$dragSession === null || $67560de7c78cb232$var$dragSession === void 0 ? void 0 : $67560de7c78cb232$var$dragSession.updateValidDropTargets();
    return ()=>{
        $67560de7c78cb232$var$dropTargets.delete(target.element);
        $67560de7c78cb232$var$dragSession === null || $67560de7c78cb232$var$dragSession === void 0 ? void 0 : $67560de7c78cb232$var$dragSession.updateValidDropTargets();
    };
}
function $67560de7c78cb232$export$aef80212ac99c003(item) {
    $67560de7c78cb232$var$dropItems.set(item.element, item);
    return ()=>{
        $67560de7c78cb232$var$dropItems.delete(item.element);
    };
}
function $67560de7c78cb232$export$549dbcf8649bf3b2(target, stringFormatter) {
    if ($67560de7c78cb232$var$dragSession) throw new Error('Cannot begin dragging while already dragging');
    $67560de7c78cb232$var$dragSession = new $67560de7c78cb232$var$DragSession(target, stringFormatter);
    requestAnimationFrame(()=>{
        if ($67560de7c78cb232$var$dragSession) {
            $67560de7c78cb232$var$dragSession.setup();
            if ((0, $7252cd45fc48c07c$export$1fb2158d224b542c)() === 'keyboard') $67560de7c78cb232$var$dragSession.next();
        }
    });
    for (let cb of $67560de7c78cb232$var$subscriptions)cb();
}
function $67560de7c78cb232$export$418e185dd3f1b968() {
    let [session, setSession] = (0, $irqIb$useState)($67560de7c78cb232$var$dragSession);
    (0, $irqIb$useEffect)(()=>{
        let cb = ()=>setSession($67560de7c78cb232$var$dragSession);
        $67560de7c78cb232$var$subscriptions.add(cb);
        return ()=>{
            $67560de7c78cb232$var$subscriptions.delete(cb);
        };
    }, []);
    return session;
}
function $67560de7c78cb232$export$403bc76cbf68cf60() {
    return !!$67560de7c78cb232$var$dragSession;
}
function $67560de7c78cb232$var$endDragging() {
    $67560de7c78cb232$var$dragSession = null;
    for (let cb of $67560de7c78cb232$var$subscriptions)cb();
}
function $67560de7c78cb232$export$7454aff2e161f241(element) {
    for (let target of $67560de7c78cb232$var$dropTargets.keys()){
        if (target.contains(element)) return true;
    }
    return false;
}
const $67560de7c78cb232$var$CANCELED_EVENTS = [
    'pointerdown',
    'pointermove',
    'pointerenter',
    'pointerleave',
    'pointerover',
    'pointerout',
    'pointerup',
    'mousedown',
    'mousemove',
    'mouseenter',
    'mouseleave',
    'mouseover',
    'mouseout',
    'mouseup',
    'touchstart',
    'touchmove',
    'touchend',
    'focusin',
    'focusout'
];
const $67560de7c78cb232$var$CLICK_EVENTS = [
    'pointerup',
    'mouseup',
    'touchend'
];
const $67560de7c78cb232$var$MESSAGES = {
    keyboard: 'dragStartedKeyboard',
    touch: 'dragStartedTouch',
    virtual: 'dragStartedVirtual'
};
class $67560de7c78cb232$var$DragSession {
    setup() {
        document.addEventListener('keydown', this.onKeyDown, true);
        document.addEventListener('keyup', this.onKeyUp, true);
        window.addEventListener('focus', this.onFocus, true);
        window.addEventListener('blur', this.onBlur, true);
        document.addEventListener('click', this.onClick, true);
        document.addEventListener('pointerdown', this.onPointerDown, true);
        for (let event of $67560de7c78cb232$var$CANCELED_EVENTS)document.addEventListener(event, this.cancelEvent, true);
        this.mutationObserver = new MutationObserver(()=>this.updateValidDropTargets());
        this.updateValidDropTargets();
        (0, $irqIb$announce)(this.stringFormatter.format($67560de7c78cb232$var$MESSAGES[(0, $7252cd45fc48c07c$export$1fb2158d224b542c)()]));
    }
    teardown() {
        var _this_mutationObserver, _this_restoreAriaHidden, _this;
        document.removeEventListener('keydown', this.onKeyDown, true);
        document.removeEventListener('keyup', this.onKeyUp, true);
        window.removeEventListener('focus', this.onFocus, true);
        window.removeEventListener('blur', this.onBlur, true);
        document.removeEventListener('click', this.onClick, true);
        document.removeEventListener('pointerdown', this.onPointerDown, true);
        for (let event of $67560de7c78cb232$var$CANCELED_EVENTS)document.removeEventListener(event, this.cancelEvent, true);
        (_this_mutationObserver = this.mutationObserver) === null || _this_mutationObserver === void 0 ? void 0 : _this_mutationObserver.disconnect();
        (_this_restoreAriaHidden = (_this = this).restoreAriaHidden) === null || _this_restoreAriaHidden === void 0 ? void 0 : _this_restoreAriaHidden.call(_this);
    }
    onKeyDown(e) {
        var _this_currentDropTarget;
        this.cancelEvent(e);
        if (e.key === 'Escape') {
            this.cancel();
            return;
        }
        if (e.key === 'Tab' && !(e.metaKey || e.altKey || e.ctrlKey)) {
            if (e.shiftKey) this.previous();
            else this.next();
        }
        if (typeof ((_this_currentDropTarget = this.currentDropTarget) === null || _this_currentDropTarget === void 0 ? void 0 : _this_currentDropTarget.onKeyDown) === 'function') this.currentDropTarget.onKeyDown(e, this.dragTarget);
    }
    onKeyUp(e) {
        this.cancelEvent(e);
        if (e.key === 'Enter') {
            if (e.altKey) this.activate();
            else this.drop();
        }
    }
    onFocus(e) {
        // Prevent focus events, except to the original drag target.
        if (e.target !== this.dragTarget.element) this.cancelEvent(e);
        // Ignore focus events on the window/document (JSDOM). Will be handled in onBlur, below.
        if (!(e.target instanceof HTMLElement) || e.target === this.dragTarget.element) return;
        let dropTarget = this.validDropTargets.find((target)=>target.element === e.target) || this.validDropTargets.find((target)=>target.element.contains(e.target));
        if (!dropTarget) {
            if (this.currentDropTarget) this.currentDropTarget.element.focus();
            else this.dragTarget.element.focus();
            return;
        }
        let item = $67560de7c78cb232$var$dropItems.get(e.target);
        this.setCurrentDropTarget(dropTarget, item);
    }
    onBlur(e) {
        if (e.target !== this.dragTarget.element) this.cancelEvent(e);
        // If nothing is gaining focus, or e.relatedTarget is the window/document (JSDOM),
        // restore focus back to the current drop target if any, or the original drag target.
        if (!e.relatedTarget || !(e.relatedTarget instanceof HTMLElement)) {
            if (this.currentDropTarget) this.currentDropTarget.element.focus();
            else this.dragTarget.element.focus();
        }
    }
    onClick(e) {
        this.cancelEvent(e);
        if ((0, $irqIb$isVirtualClick)(e) || this.isVirtualClick) {
            if (e.target === this.dragTarget.element) {
                this.cancel();
                return;
            }
            let dropTarget = this.validDropTargets.find((target)=>target.element.contains(e.target));
            if (dropTarget) {
                let item = $67560de7c78cb232$var$dropItems.get(e.target);
                this.setCurrentDropTarget(dropTarget, item);
                this.drop(item);
            }
        }
    }
    onPointerDown(e) {
        // Android Talkback double tap has e.detail = 1 for onClick. Detect the virtual click in onPointerDown before onClick fires
        // so we can properly perform cancel and drop operations.
        this.cancelEvent(e);
        this.isVirtualClick = (0, $irqIb$isVirtualPointerEvent)(e);
    }
    cancelEvent(e) {
        var _this_dragTarget;
        // Allow focusin and focusout on the drag target so focus ring works properly.
        if ((e.type === 'focusin' || e.type === 'focusout') && e.target === ((_this_dragTarget = this.dragTarget) === null || _this_dragTarget === void 0 ? void 0 : _this_dragTarget.element)) return;
        // Allow default for events that might cancel a click event
        if (!$67560de7c78cb232$var$CLICK_EVENTS.includes(e.type)) e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
    }
    updateValidDropTargets() {
        if (!this.mutationObserver) return;
        this.mutationObserver.disconnect();
        if (this.restoreAriaHidden) this.restoreAriaHidden();
        this.validDropTargets = $67560de7c78cb232$var$findValidDropTargets(this.dragTarget);
        // Shuffle drop target order based on starting drag target.
        if (this.validDropTargets.length > 0) {
            let nearestIndex = this.findNearestDropTarget();
            this.validDropTargets = [
                ...this.validDropTargets.slice(nearestIndex),
                ...this.validDropTargets.slice(0, nearestIndex)
            ];
        }
        if (this.currentDropTarget && !this.validDropTargets.includes(this.currentDropTarget)) this.setCurrentDropTarget(this.validDropTargets[0]);
        // Find valid drop items within collections
        let types = (0, $7252cd45fc48c07c$export$e1d41611756c6326)(this.dragTarget.items);
        let validDropItems = [
            ...$67560de7c78cb232$var$dropItems.values()
        ].filter((item)=>{
            if (typeof item.getDropOperation === 'function') return item.getDropOperation(types, this.dragTarget.allowedDropOperations) !== 'cancel';
            return true;
        });
        // Filter out drop targets that contain valid items. We don't want to stop hiding elements
        // other than the drop items that exist inside the collection.
        let visibleDropTargets = this.validDropTargets.filter((target)=>!validDropItems.some((item)=>target.element.contains(item.element)));
        this.restoreAriaHidden = (0, $irqIb$ariaHideOutside)([
            this.dragTarget.element,
            ...validDropItems.map((item)=>item.element),
            ...visibleDropTargets.map((target)=>target.element)
        ]);
        this.mutationObserver.observe(document.body, {
            subtree: true,
            attributes: true,
            attributeFilter: [
                'aria-hidden'
            ]
        });
    }
    next() {
        if (!this.currentDropTarget) {
            this.setCurrentDropTarget(this.validDropTargets[0]);
            return;
        }
        let index = this.validDropTargets.indexOf(this.currentDropTarget);
        if (index < 0) {
            this.setCurrentDropTarget(this.validDropTargets[0]);
            return;
        }
        // If we've reached the end of the valid drop targets, cycle back to the original drag target.
        // This lets the user cancel the drag in case they don't have an Escape key (e.g. iPad keyboard case).
        if (index === this.validDropTargets.length - 1) {
            if (!this.dragTarget.element.closest('[aria-hidden="true"]')) {
                this.setCurrentDropTarget(null);
                this.dragTarget.element.focus();
            } else this.setCurrentDropTarget(this.validDropTargets[0]);
        } else this.setCurrentDropTarget(this.validDropTargets[index + 1]);
    }
    previous() {
        if (!this.currentDropTarget) {
            this.setCurrentDropTarget(this.validDropTargets[this.validDropTargets.length - 1]);
            return;
        }
        let index = this.validDropTargets.indexOf(this.currentDropTarget);
        if (index < 0) {
            this.setCurrentDropTarget(this.validDropTargets[this.validDropTargets.length - 1]);
            return;
        }
        // If we've reached the start of the valid drop targets, cycle back to the original drag target.
        // This lets the user cancel the drag in case they don't have an Escape key (e.g. iPad keyboard case).
        if (index === 0) {
            if (!this.dragTarget.element.closest('[aria-hidden="true"]')) {
                this.setCurrentDropTarget(null);
                this.dragTarget.element.focus();
            } else this.setCurrentDropTarget(this.validDropTargets[this.validDropTargets.length - 1]);
        } else this.setCurrentDropTarget(this.validDropTargets[index - 1]);
    }
    findNearestDropTarget() {
        let dragTargetRect = this.dragTarget.element.getBoundingClientRect();
        let minDistance = Infinity;
        let nearest = -1;
        for(let i = 0; i < this.validDropTargets.length; i++){
            let dropTarget = this.validDropTargets[i];
            let rect = dropTarget.element.getBoundingClientRect();
            let dx = rect.left - dragTargetRect.left;
            let dy = rect.top - dragTargetRect.top;
            let dist = dx * dx + dy * dy;
            if (dist < minDistance) {
                minDistance = dist;
                nearest = i;
            }
        }
        return nearest;
    }
    setCurrentDropTarget(dropTarget, item) {
        if (dropTarget !== this.currentDropTarget) {
            if (this.currentDropTarget && typeof this.currentDropTarget.onDropExit === 'function') {
                let rect = this.currentDropTarget.element.getBoundingClientRect();
                this.currentDropTarget.onDropExit({
                    type: 'dropexit',
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2
                });
            }
            this.currentDropTarget = dropTarget;
            if (dropTarget) {
                if (typeof dropTarget.onDropEnter === 'function') {
                    let rect = dropTarget.element.getBoundingClientRect();
                    dropTarget.onDropEnter({
                        type: 'dropenter',
                        x: rect.left + rect.width / 2,
                        y: rect.top + rect.height / 2
                    }, this.dragTarget);
                }
                if (!item) dropTarget === null || dropTarget === void 0 ? void 0 : dropTarget.element.focus();
            }
        }
        if (item != null && item !== this.currentDropItem) {
            if (this.currentDropTarget && typeof this.currentDropTarget.onDropTargetEnter === 'function') this.currentDropTarget.onDropTargetEnter(item.target);
            item.element.focus();
            this.currentDropItem = item;
            // Announce first drop target after drag start announcement finishes.
            // Otherwise, it will never get announced because drag start announcement is assertive.
            if (!this.initialFocused) {
                let label = item === null || item === void 0 ? void 0 : item.element.getAttribute('aria-label');
                if (label) (0, $irqIb$announce)(label, 'polite');
                this.initialFocused = true;
            }
        }
    }
    end() {
        var // Re-trigger focus event on active element, since it will not have received it during dragging (see cancelEvent).
        // This corrects state such as whether focus ring should appear.
        // useDroppableCollection handles this itself, so this is only for standalone drop zones.
        _document_activeElement;
        this.teardown();
        $67560de7c78cb232$var$endDragging();
        if (typeof this.dragTarget.onDragEnd === 'function') {
            let target = this.currentDropTarget && this.dropOperation !== 'cancel' ? this.currentDropTarget : this.dragTarget;
            let rect = target.element.getBoundingClientRect();
            this.dragTarget.onDragEnd({
                type: 'dragend',
                x: rect.x + rect.width / 2,
                y: rect.y + rect.height / 2,
                dropOperation: this.dropOperation || 'cancel'
            });
        }
        if (this.currentDropTarget && !this.currentDropTarget.preventFocusOnDrop) (_document_activeElement = document.activeElement) === null || _document_activeElement === void 0 ? void 0 : _document_activeElement.dispatchEvent(new FocusEvent('focusin', {
            bubbles: true
        }));
        this.setCurrentDropTarget(null);
    }
    cancel() {
        this.setCurrentDropTarget(null);
        this.end();
        if (!this.dragTarget.element.closest('[aria-hidden="true"]')) this.dragTarget.element.focus();
        (0, $irqIb$announce)(this.stringFormatter.format('dropCanceled'));
    }
    drop(item) {
        if (!this.currentDropTarget) {
            this.cancel();
            return;
        }
        if (typeof (item === null || item === void 0 ? void 0 : item.getDropOperation) === 'function') {
            let types = (0, $7252cd45fc48c07c$export$e1d41611756c6326)(this.dragTarget.items);
            this.dropOperation = item.getDropOperation(types, this.dragTarget.allowedDropOperations);
        } else if (typeof this.currentDropTarget.getDropOperation === 'function') {
            let types = (0, $7252cd45fc48c07c$export$e1d41611756c6326)(this.dragTarget.items);
            this.dropOperation = this.currentDropTarget.getDropOperation(types, this.dragTarget.allowedDropOperations);
        } else // TODO: show menu ??
        this.dropOperation = this.dragTarget.allowedDropOperations[0];
        if (typeof this.currentDropTarget.onDrop === 'function') {
            let items = this.dragTarget.items.map((item)=>({
                    kind: 'text',
                    types: new Set(Object.keys(item)),
                    getText: (type)=>Promise.resolve(item[type])
                }));
            let rect = this.currentDropTarget.element.getBoundingClientRect();
            var _item_target;
            this.currentDropTarget.onDrop({
                type: 'drop',
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
                items: items,
                dropOperation: this.dropOperation
            }, (_item_target = item === null || item === void 0 ? void 0 : item.target) !== null && _item_target !== void 0 ? _item_target : null);
        }
        this.end();
        (0, $irqIb$announce)(this.stringFormatter.format('dropComplete'));
    }
    activate() {
        if (this.currentDropTarget && typeof this.currentDropTarget.onDropActivate === 'function') {
            let rect = this.currentDropTarget.element.getBoundingClientRect();
            this.currentDropTarget.onDropActivate({
                type: 'dropactivate',
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
            }, null);
        }
    }
    constructor(target, stringFormatter){
        this.validDropTargets = [];
        this.currentDropTarget = null;
        this.currentDropItem = null;
        this.dropOperation = null;
        this.mutationObserver = null;
        this.restoreAriaHidden = null;
        this.isVirtualClick = false;
        this.dragTarget = target;
        this.stringFormatter = stringFormatter;
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
        this.onFocus = this.onFocus.bind(this);
        this.onBlur = this.onBlur.bind(this);
        this.onClick = this.onClick.bind(this);
        this.onPointerDown = this.onPointerDown.bind(this);
        this.cancelEvent = this.cancelEvent.bind(this);
        this.initialFocused = false;
    }
}
function $67560de7c78cb232$var$findValidDropTargets(options) {
    let types = (0, $7252cd45fc48c07c$export$e1d41611756c6326)(options.items);
    return [
        ...$67560de7c78cb232$var$dropTargets.values()
    ].filter((target)=>{
        if (target.element.closest('[aria-hidden="true"]')) return false;
        if (typeof target.getDropOperation === 'function') return target.getDropOperation(types, options.allowedDropOperations) !== 'cancel';
        return true;
    });
}


export {$67560de7c78cb232$export$c28d9fb4a54e471a as registerDropTarget, $67560de7c78cb232$export$aef80212ac99c003 as registerDropItem, $67560de7c78cb232$export$549dbcf8649bf3b2 as beginDragging, $67560de7c78cb232$export$418e185dd3f1b968 as useDragSession, $67560de7c78cb232$export$403bc76cbf68cf60 as isVirtualDragging, $67560de7c78cb232$export$7454aff2e161f241 as isValidDropTarget};
//# sourceMappingURL=DragManager.module.js.map
