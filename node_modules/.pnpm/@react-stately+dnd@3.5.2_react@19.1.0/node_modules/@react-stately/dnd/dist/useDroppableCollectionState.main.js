var $ax21c$react = require("react");


function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "useDroppableCollectionState", () => $6ce4cbfbe5e354f1$export$926850f6ecef79d0);
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
function $6ce4cbfbe5e354f1$export$926850f6ecef79d0(props) {
    let { acceptedDragTypes: acceptedDragTypes = 'all', isDisabled: isDisabled, onInsert: onInsert, onRootDrop: onRootDrop, onItemDrop: onItemDrop, onReorder: onReorder, shouldAcceptItemDrop: shouldAcceptItemDrop, collection: collection, selectionManager: selectionManager, onDropEnter: onDropEnter, getDropOperation: getDropOperation, onDrop: onDrop } = props;
    let [target, setTarget] = (0, $ax21c$react.useState)(null);
    let targetRef = (0, $ax21c$react.useRef)(null);
    let getOppositeTarget = (target)=>{
        if (target.dropPosition === 'before') {
            let key = collection.getKeyBefore(target.key);
            return key != null ? {
                type: 'item',
                key: key,
                dropPosition: 'after'
            } : null;
        } else if (target.dropPosition === 'after') {
            let key = collection.getKeyAfter(target.key);
            return key != null ? {
                type: 'item',
                key: key,
                dropPosition: 'before'
            } : null;
        }
        return null;
    };
    let defaultGetDropOperation = (0, $ax21c$react.useCallback)((e)=>{
        let { target: target, types: types, allowedOperations: allowedOperations, isInternal: isInternal, draggingKeys: draggingKeys } = e;
        if (isDisabled || !target) return 'cancel';
        if (acceptedDragTypes === 'all' || acceptedDragTypes.some((type)=>types.has(type))) {
            let isValidInsert = onInsert && target.type === 'item' && !isInternal && (target.dropPosition === 'before' || target.dropPosition === 'after');
            let isValidReorder = onReorder && target.type === 'item' && isInternal && (target.dropPosition === 'before' || target.dropPosition === 'after');
            // Feedback was that internal root drop was weird so preventing that from happening
            let isValidRootDrop = onRootDrop && target.type === 'root' && !isInternal;
            // Automatically prevent items (i.e. folders) from being dropped on themselves.
            let isValidOnItemDrop = onItemDrop && target.type === 'item' && target.dropPosition === 'on' && !(isInternal && target.key != null && draggingKeys.has(target.key)) && (!shouldAcceptItemDrop || shouldAcceptItemDrop(target, types));
            if (onDrop || isValidInsert || isValidReorder || isValidRootDrop || isValidOnItemDrop) {
                if (getDropOperation) return getDropOperation(target, types, allowedOperations);
                else return allowedOperations[0];
            }
        }
        return 'cancel';
    }, [
        isDisabled,
        acceptedDragTypes,
        getDropOperation,
        onInsert,
        onRootDrop,
        onItemDrop,
        shouldAcceptItemDrop,
        onReorder,
        onDrop
    ]);
    return {
        collection: collection,
        selectionManager: selectionManager,
        isDisabled: isDisabled,
        target: target,
        setTarget (newTarget) {
            if (this.isDropTarget(newTarget)) return;
            let target = targetRef.current;
            if (target && typeof props.onDropExit === 'function') props.onDropExit({
                type: 'dropexit',
                x: 0,
                y: 0,
                target: target
            });
            if (newTarget && typeof onDropEnter === 'function') onDropEnter({
                type: 'dropenter',
                x: 0,
                y: 0,
                target: newTarget
            });
            targetRef.current = newTarget !== null && newTarget !== void 0 ? newTarget : null;
            setTarget(newTarget !== null && newTarget !== void 0 ? newTarget : null);
        },
        isDropTarget (dropTarget) {
            let target = targetRef.current;
            if (!target || !dropTarget) return false;
            if ($6ce4cbfbe5e354f1$var$isEqualDropTarget(dropTarget, target)) return true;
            // Check if the targets point at the same point between two items, one referring before, and the other after.
            if ((dropTarget === null || dropTarget === void 0 ? void 0 : dropTarget.type) === 'item' && (target === null || target === void 0 ? void 0 : target.type) === 'item' && dropTarget.key !== target.key && dropTarget.dropPosition !== target.dropPosition && dropTarget.dropPosition !== 'on' && target.dropPosition !== 'on') return $6ce4cbfbe5e354f1$var$isEqualDropTarget(getOppositeTarget(dropTarget), target) || $6ce4cbfbe5e354f1$var$isEqualDropTarget(dropTarget, getOppositeTarget(target));
            return false;
        },
        getDropOperation (e) {
            return defaultGetDropOperation(e);
        }
    };
}
function $6ce4cbfbe5e354f1$var$isEqualDropTarget(a, b) {
    if (!a) return !b;
    switch(a.type){
        case 'root':
            return (b === null || b === void 0 ? void 0 : b.type) === 'root';
        case 'item':
            return (b === null || b === void 0 ? void 0 : b.type) === 'item' && (b === null || b === void 0 ? void 0 : b.key) === a.key && (b === null || b === void 0 ? void 0 : b.dropPosition) === a.dropPosition;
    }
}


//# sourceMappingURL=useDroppableCollectionState.main.js.map
