var $4620ae0dc40f0031$exports = require("./utils.main.js");
var $28e10663603f5ea1$exports = require("./DragManager.main.js");
var $12cc069a1c69155b$exports = require("./useAutoScroll.main.js");
var $1ca228bc9257ca16$exports = require("./useDrop.main.js");
var $foOxf$react = require("react");
var $foOxf$reactariautils = require("@react-aria/utils");
var $foOxf$reactariainteractions = require("@react-aria/interactions");
var $foOxf$reactariai18n = require("@react-aria/i18n");


function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "useDroppableCollection", () => $7f93a158ac20b90a$export$f4e2f423c21f7b04);
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







const $7f93a158ac20b90a$var$DROP_POSITIONS = [
    'before',
    'on',
    'after'
];
const $7f93a158ac20b90a$var$DROP_POSITIONS_RTL = [
    'after',
    'on',
    'before'
];
function $7f93a158ac20b90a$export$f4e2f423c21f7b04(props, state, ref) {
    let localState = (0, $foOxf$react.useRef)({
        props: props,
        state: state,
        nextTarget: null,
        dropOperation: null
    }).current;
    localState.props = props;
    localState.state = state;
    let defaultOnDrop = (0, $foOxf$react.useCallback)(async (e)=>{
        let { onInsert: onInsert, onRootDrop: onRootDrop, onItemDrop: onItemDrop, onReorder: onReorder, acceptedDragTypes: acceptedDragTypes = 'all', shouldAcceptItemDrop: shouldAcceptItemDrop } = localState.props;
        let { draggingKeys: draggingKeys } = (0, $4620ae0dc40f0031$exports.globalDndState);
        let isInternal = (0, $4620ae0dc40f0031$exports.isInternalDropOperation)(ref);
        let { target: target, dropOperation: dropOperation, items: items } = e;
        let filteredItems = items;
        if (acceptedDragTypes !== 'all' || shouldAcceptItemDrop) filteredItems = items.filter((item)=>{
            let itemTypes;
            if (item.kind === 'directory') itemTypes = new Set([
                (0, $4620ae0dc40f0031$exports.DIRECTORY_DRAG_TYPE)
            ]);
            else itemTypes = item.kind === 'file' ? new Set([
                item.type
            ]) : item.types;
            if (acceptedDragTypes === 'all' || acceptedDragTypes.some((type)=>itemTypes.has(type))) {
                // If we are performing a on item drop, check if the item in question accepts the dropped item since the item may have heavier restrictions
                // than the droppable collection itself
                if (target.type === 'item' && target.dropPosition === 'on' && shouldAcceptItemDrop) return shouldAcceptItemDrop(target, itemTypes);
                return true;
            }
            return false;
        });
        if (filteredItems.length > 0) {
            if (target.type === 'root' && onRootDrop) await onRootDrop({
                items: filteredItems,
                dropOperation: dropOperation
            });
            if (target.type === 'item') {
                if (target.dropPosition === 'on' && onItemDrop) await onItemDrop({
                    items: filteredItems,
                    dropOperation: dropOperation,
                    isInternal: isInternal,
                    target: target
                });
                if (target.dropPosition !== 'on') {
                    if (!isInternal && onInsert) await onInsert({
                        items: filteredItems,
                        dropOperation: dropOperation,
                        target: target
                    });
                    if (isInternal && onReorder) await onReorder({
                        keys: draggingKeys,
                        dropOperation: dropOperation,
                        target: target
                    });
                }
            }
        }
    }, [
        localState,
        ref
    ]);
    let autoScroll = (0, $12cc069a1c69155b$exports.useAutoScroll)(ref);
    let { dropProps: dropProps } = (0, $1ca228bc9257ca16$exports.useDrop)({
        ref: ref,
        onDropEnter () {
            if (localState.nextTarget != null) state.setTarget(localState.nextTarget);
        },
        onDropMove (e) {
            if (localState.nextTarget != null) state.setTarget(localState.nextTarget);
            autoScroll.move(e.x, e.y);
        },
        getDropOperationForPoint (types, allowedOperations, x, y) {
            let { draggingKeys: draggingKeys, dropCollectionRef: dropCollectionRef } = (0, $4620ae0dc40f0031$exports.globalDndState);
            let isInternal = (0, $4620ae0dc40f0031$exports.isInternalDropOperation)(ref);
            let isValidDropTarget = (target)=>state.getDropOperation({
                    target: target,
                    types: types,
                    allowedOperations: allowedOperations,
                    isInternal: isInternal,
                    draggingKeys: draggingKeys
                }) !== 'cancel';
            let target = props.dropTargetDelegate.getDropTargetFromPoint(x, y, isValidDropTarget);
            if (!target) {
                localState.dropOperation = 'cancel';
                localState.nextTarget = null;
                return 'cancel';
            }
            localState.dropOperation = state.getDropOperation({
                target: target,
                types: types,
                allowedOperations: allowedOperations,
                isInternal: isInternal,
                draggingKeys: draggingKeys
            });
            // If the target doesn't accept the drop, see if the root accepts it instead.
            if (localState.dropOperation === 'cancel') {
                let rootTarget = {
                    type: 'root'
                };
                let dropOperation = state.getDropOperation({
                    target: rootTarget,
                    types: types,
                    allowedOperations: allowedOperations,
                    isInternal: isInternal,
                    draggingKeys: draggingKeys
                });
                if (dropOperation !== 'cancel') {
                    target = rootTarget;
                    localState.dropOperation = dropOperation;
                }
            }
            // Only set dropCollectionRef if there is a valid drop target since we cleanup dropCollectionRef in onDropExit
            // which only runs when leaving a valid drop target or if the dropEffect become none (mouse dnd only).
            if (target && localState.dropOperation !== 'cancel' && (ref === null || ref === void 0 ? void 0 : ref.current) !== (dropCollectionRef === null || dropCollectionRef === void 0 ? void 0 : dropCollectionRef.current)) (0, $4620ae0dc40f0031$exports.setDropCollectionRef)(ref);
            localState.nextTarget = localState.dropOperation === 'cancel' ? null : target;
            return localState.dropOperation;
        },
        onDropExit () {
            (0, $4620ae0dc40f0031$exports.setDropCollectionRef)(undefined);
            state.setTarget(null);
            autoScroll.stop();
        },
        onDropActivate (e) {
            var _state_target, _state_target1;
            if (((_state_target = state.target) === null || _state_target === void 0 ? void 0 : _state_target.type) === 'item' && ((_state_target1 = state.target) === null || _state_target1 === void 0 ? void 0 : _state_target1.dropPosition) === 'on' && typeof props.onDropActivate === 'function') props.onDropActivate({
                type: 'dropactivate',
                x: e.x,
                y: e.y,
                target: state.target
            });
        },
        onDrop (e) {
            (0, $4620ae0dc40f0031$exports.setDropCollectionRef)(ref);
            if (state.target) onDrop(e, state.target);
            // If there wasn't a collection being tracked as a dragged collection, then we are in a case where a non RSP drag is dropped on a
            // RSP collection and thus we don't need to preserve the global DnD state for onDragEnd
            let { draggingCollectionRef: draggingCollectionRef } = (0, $4620ae0dc40f0031$exports.globalDndState);
            if (draggingCollectionRef == null) (0, $4620ae0dc40f0031$exports.clearGlobalDnDState)();
        }
    });
    let droppingState = (0, $foOxf$react.useRef)(null);
    let updateFocusAfterDrop = (0, $foOxf$react.useCallback)(()=>{
        let { state: state } = localState;
        if (droppingState.current) {
            var _state_collection_getItem;
            let { target: target, collection: prevCollection, selectedKeys: prevSelectedKeys, focusedKey: prevFocusedKey, isInternal: isInternal, draggingKeys: draggingKeys } = droppingState.current;
            // If an insert occurs during a drop, we want to immediately select these items to give
            // feedback to the user that a drop occurred. Only do this if the selection didn't change
            // since the drop started so we don't override if the user or application did something.
            if (state.collection.size > prevCollection.size && state.selectionManager.isSelectionEqual(prevSelectedKeys)) {
                let newKeys = new Set();
                for (let key of state.collection.getKeys())if (!prevCollection.getItem(key)) newKeys.add(key);
                state.selectionManager.setSelectedKeys(newKeys);
                // If the focused item didn't change since the drop occurred, also focus the first
                // inserted item. If selection is disabled, then also show the focus ring so there
                // is some indication that items were added.
                if (state.selectionManager.focusedKey === prevFocusedKey) {
                    let first = newKeys.keys().next().value;
                    let item = state.collection.getItem(first);
                    // If this is a cell, focus the parent row.
                    if ((item === null || item === void 0 ? void 0 : item.type) === 'cell') first = item.parentKey;
                    state.selectionManager.setFocusedKey(first);
                    if (state.selectionManager.selectionMode === 'none') (0, $foOxf$reactariainteractions.setInteractionModality)('keyboard');
                }
            } else if (prevFocusedKey != null && state.selectionManager.focusedKey === prevFocusedKey && isInternal && target.type === 'item' && target.dropPosition !== 'on' && draggingKeys.has((_state_collection_getItem = state.collection.getItem(prevFocusedKey)) === null || _state_collection_getItem === void 0 ? void 0 : _state_collection_getItem.parentKey)) {
                var _state_collection_getItem1;
                var _state_collection_getItem_parentKey;
                // Focus row instead of cell when reordering.
                state.selectionManager.setFocusedKey((_state_collection_getItem_parentKey = (_state_collection_getItem1 = state.collection.getItem(prevFocusedKey)) === null || _state_collection_getItem1 === void 0 ? void 0 : _state_collection_getItem1.parentKey) !== null && _state_collection_getItem_parentKey !== void 0 ? _state_collection_getItem_parentKey : null);
                (0, $foOxf$reactariainteractions.setInteractionModality)('keyboard');
            } else if (state.selectionManager.focusedKey === prevFocusedKey && target.type === 'item' && target.dropPosition === 'on' && state.collection.getItem(target.key) != null) {
                // If focus didn't move already (e.g. due to an insert), and the user dropped on an item,
                // focus that item and show the focus ring to give the user feedback that the drop occurred.
                // Also show the focus ring if the focused key is not selected, e.g. in case of a reorder.
                state.selectionManager.setFocusedKey(target.key);
                (0, $foOxf$reactariainteractions.setInteractionModality)('keyboard');
            } else if (state.selectionManager.focusedKey != null && !state.selectionManager.isSelected(state.selectionManager.focusedKey)) (0, $foOxf$reactariainteractions.setInteractionModality)('keyboard');
            state.selectionManager.setFocused(true);
        }
    }, [
        localState
    ]);
    let onDrop = (0, $foOxf$react.useCallback)((e, target)=>{
        let { state: state } = localState;
        // Save some state of the collection/selection before the drop occurs so we can compare later.
        droppingState.current = {
            timeout: undefined,
            focusedKey: state.selectionManager.focusedKey,
            collection: state.collection,
            selectedKeys: state.selectionManager.selectedKeys,
            draggingKeys: (0, $4620ae0dc40f0031$exports.globalDndState).draggingKeys,
            isInternal: (0, $4620ae0dc40f0031$exports.isInternalDropOperation)(ref),
            target: target
        };
        let onDropFn = localState.props.onDrop || defaultOnDrop;
        onDropFn({
            type: 'drop',
            x: e.x,
            y: e.y,
            target: target,
            items: e.items,
            dropOperation: e.dropOperation
        });
        // Wait for a short time period after the onDrop is called to allow the data to be read asynchronously
        // and for React to re-render. If the collection didn't already change during this time (handled below),
        // update the focused key here.
        droppingState.current.timeout = setTimeout(()=>{
            updateFocusAfterDrop();
            droppingState.current = null;
        }, 50);
    }, [
        localState,
        defaultOnDrop,
        ref,
        updateFocusAfterDrop
    ]);
    (0, $foOxf$react.useEffect)(()=>{
        return ()=>{
            if (droppingState.current) clearTimeout(droppingState.current.timeout);
        };
    }, []);
    (0, $foOxf$reactariautils.useLayoutEffect)(()=>{
        // If the collection changed after a drop, update the focused key.
        if (droppingState.current && state.collection !== droppingState.current.collection) updateFocusAfterDrop();
    });
    let { direction: direction } = (0, $foOxf$reactariai18n.useLocale)();
    (0, $foOxf$react.useEffect)(()=>{
        if (!ref.current) return;
        let getNextTarget = (target, wrap = true, horizontal = false)=>{
            var _keyboardDelegate_getKeyRightOf, _keyboardDelegate_getKeyBelow, _keyboardDelegate_getLastKey, _keyboardDelegate_getFirstKey;
            if (!target) return {
                type: 'root'
            };
            let { keyboardDelegate: keyboardDelegate } = localState.props;
            let nextKey;
            if ((target === null || target === void 0 ? void 0 : target.type) === 'item') nextKey = horizontal ? (_keyboardDelegate_getKeyRightOf = keyboardDelegate.getKeyRightOf) === null || _keyboardDelegate_getKeyRightOf === void 0 ? void 0 : _keyboardDelegate_getKeyRightOf.call(keyboardDelegate, target.key) : (_keyboardDelegate_getKeyBelow = keyboardDelegate.getKeyBelow) === null || _keyboardDelegate_getKeyBelow === void 0 ? void 0 : _keyboardDelegate_getKeyBelow.call(keyboardDelegate, target.key);
            else nextKey = horizontal && direction === 'rtl' ? (_keyboardDelegate_getLastKey = keyboardDelegate.getLastKey) === null || _keyboardDelegate_getLastKey === void 0 ? void 0 : _keyboardDelegate_getLastKey.call(keyboardDelegate) : (_keyboardDelegate_getFirstKey = keyboardDelegate.getFirstKey) === null || _keyboardDelegate_getFirstKey === void 0 ? void 0 : _keyboardDelegate_getFirstKey.call(keyboardDelegate);
            let dropPositions = horizontal && direction === 'rtl' ? $7f93a158ac20b90a$var$DROP_POSITIONS_RTL : $7f93a158ac20b90a$var$DROP_POSITIONS;
            let dropPosition = dropPositions[0];
            if (target.type === 'item') {
                // If the the keyboard delegate returned the next key in the collection,
                // first try the other positions in the current key. Otherwise (e.g. in a grid layout),
                // jump to the same drop position in the new key.
                let nextCollectionKey = horizontal && direction === 'rtl' ? localState.state.collection.getKeyBefore(target.key) : localState.state.collection.getKeyAfter(target.key);
                if (nextKey == null || nextKey === nextCollectionKey) {
                    let positionIndex = dropPositions.indexOf(target.dropPosition);
                    let nextDropPosition = dropPositions[positionIndex + 1];
                    if (positionIndex < dropPositions.length - 1 && !(nextDropPosition === dropPositions[2] && nextKey != null)) return {
                        type: 'item',
                        key: target.key,
                        dropPosition: nextDropPosition
                    };
                    // If the last drop position was 'after', then 'before' on the next key is equivalent.
                    // Switch to 'on' instead.
                    if (target.dropPosition === dropPositions[2]) dropPosition = 'on';
                } else dropPosition = target.dropPosition;
            }
            if (nextKey == null) {
                if (wrap) return {
                    type: 'root'
                };
                return null;
            }
            return {
                type: 'item',
                key: nextKey,
                dropPosition: dropPosition
            };
        };
        let getPreviousTarget = (target, wrap = true, horizontal = false)=>{
            var _keyboardDelegate_getKeyLeftOf, _keyboardDelegate_getKeyAbove, _keyboardDelegate_getFirstKey, _keyboardDelegate_getLastKey;
            let { keyboardDelegate: keyboardDelegate } = localState.props;
            let nextKey;
            if ((target === null || target === void 0 ? void 0 : target.type) === 'item') nextKey = horizontal ? (_keyboardDelegate_getKeyLeftOf = keyboardDelegate.getKeyLeftOf) === null || _keyboardDelegate_getKeyLeftOf === void 0 ? void 0 : _keyboardDelegate_getKeyLeftOf.call(keyboardDelegate, target.key) : (_keyboardDelegate_getKeyAbove = keyboardDelegate.getKeyAbove) === null || _keyboardDelegate_getKeyAbove === void 0 ? void 0 : _keyboardDelegate_getKeyAbove.call(keyboardDelegate, target.key);
            else nextKey = horizontal && direction === 'rtl' ? (_keyboardDelegate_getFirstKey = keyboardDelegate.getFirstKey) === null || _keyboardDelegate_getFirstKey === void 0 ? void 0 : _keyboardDelegate_getFirstKey.call(keyboardDelegate) : (_keyboardDelegate_getLastKey = keyboardDelegate.getLastKey) === null || _keyboardDelegate_getLastKey === void 0 ? void 0 : _keyboardDelegate_getLastKey.call(keyboardDelegate);
            let dropPositions = horizontal && direction === 'rtl' ? $7f93a158ac20b90a$var$DROP_POSITIONS_RTL : $7f93a158ac20b90a$var$DROP_POSITIONS;
            let dropPosition = !target || target.type === 'root' ? dropPositions[2] : 'on';
            if ((target === null || target === void 0 ? void 0 : target.type) === 'item') {
                // If the the keyboard delegate returned the previous key in the collection,
                // first try the other positions in the current key. Otherwise (e.g. in a grid layout),
                // jump to the same drop position in the new key.
                let prevCollectionKey = horizontal && direction === 'rtl' ? localState.state.collection.getKeyAfter(target.key) : localState.state.collection.getKeyBefore(target.key);
                if (nextKey == null || nextKey === prevCollectionKey) {
                    let positionIndex = dropPositions.indexOf(target.dropPosition);
                    let nextDropPosition = dropPositions[positionIndex - 1];
                    if (positionIndex > 0 && nextDropPosition !== dropPositions[2]) return {
                        type: 'item',
                        key: target.key,
                        dropPosition: nextDropPosition
                    };
                    // If the last drop position was 'before', then 'after' on the previous key is equivalent.
                    // Switch to 'on' instead.
                    if (target.dropPosition === dropPositions[0]) dropPosition = 'on';
                } else dropPosition = target.dropPosition;
            }
            if (nextKey == null) {
                if (wrap) return {
                    type: 'root'
                };
                return null;
            }
            return {
                type: 'item',
                key: nextKey,
                dropPosition: dropPosition
            };
        };
        let nextValidTarget = (target, types, allowedDropOperations, getNextTarget, wrap = true)=>{
            let seenRoot = 0;
            let operation;
            let { draggingKeys: draggingKeys } = (0, $4620ae0dc40f0031$exports.globalDndState);
            let isInternal = (0, $4620ae0dc40f0031$exports.isInternalDropOperation)(ref);
            do {
                let nextTarget = getNextTarget(target, wrap);
                if (!nextTarget) return null;
                target = nextTarget;
                operation = localState.state.getDropOperation({
                    target: nextTarget,
                    types: types,
                    allowedOperations: allowedDropOperations,
                    isInternal: isInternal,
                    draggingKeys: draggingKeys
                });
                if (target.type === 'root') seenRoot++;
            }while (operation === 'cancel' && !localState.state.isDropTarget(target) && seenRoot < 2);
            if (operation === 'cancel') return null;
            return target;
        };
        return $28e10663603f5ea1$exports.registerDropTarget({
            element: ref.current,
            preventFocusOnDrop: true,
            getDropOperation (types, allowedOperations) {
                if (localState.state.target) {
                    let { draggingKeys: draggingKeys } = (0, $4620ae0dc40f0031$exports.globalDndState);
                    let isInternal = (0, $4620ae0dc40f0031$exports.isInternalDropOperation)(ref);
                    return localState.state.getDropOperation({
                        target: localState.state.target,
                        types: types,
                        allowedOperations: allowedOperations,
                        isInternal: isInternal,
                        draggingKeys: draggingKeys
                    });
                }
                // Check if any of the targets accept the drop.
                // TODO: should we have a faster way of doing this or e.g. for pagination?
                let target = nextValidTarget(null, types, allowedOperations, getNextTarget);
                return target ? 'move' : 'cancel';
            },
            onDropEnter (e, drag) {
                let types = (0, $4620ae0dc40f0031$exports.getTypes)(drag.items);
                let selectionManager = localState.state.selectionManager;
                let target = null;
                // Update the drop collection ref tracker for useDroppableItem's getDropOperation isInternal check
                (0, $4620ae0dc40f0031$exports.setDropCollectionRef)(ref);
                // When entering the droppable collection for the first time, the default drop target
                // is after the focused key.
                let key = selectionManager.focusedKey;
                let dropPosition = 'after';
                // If the focused key is a cell, get the parent item instead.
                // For now, we assume that individual cells cannot be dropped on.
                let item = key != null ? localState.state.collection.getItem(key) : null;
                if ((item === null || item === void 0 ? void 0 : item.type) === 'cell') key = item.parentKey;
                // If the focused item is also selected, the default drop target is after the last selected item.
                // But if the focused key is the first selected item, then default to before the first selected item.
                // This is to make reordering lists slightly easier. If you select top down, we assume you want to
                // move the items down. If you select bottom up, we assume you want to move the items up.
                if (key != null && selectionManager.isSelected(key)) {
                    if (selectionManager.selectedKeys.size > 1 && selectionManager.firstSelectedKey === key) dropPosition = 'before';
                    else key = selectionManager.lastSelectedKey;
                }
                if (key != null) {
                    target = {
                        type: 'item',
                        key: key,
                        dropPosition: dropPosition
                    };
                    let { draggingKeys: draggingKeys } = (0, $4620ae0dc40f0031$exports.globalDndState);
                    let isInternal = (0, $4620ae0dc40f0031$exports.isInternalDropOperation)(ref);
                    var _nextValidTarget;
                    // If the default target is not valid, find the next one that is.
                    if (localState.state.getDropOperation({
                        target: target,
                        types: types,
                        allowedOperations: drag.allowedDropOperations,
                        isInternal: isInternal,
                        draggingKeys: draggingKeys
                    }) === 'cancel') target = (_nextValidTarget = nextValidTarget(target, types, drag.allowedDropOperations, getNextTarget, false)) !== null && _nextValidTarget !== void 0 ? _nextValidTarget : nextValidTarget(target, types, drag.allowedDropOperations, getPreviousTarget, false);
                }
                // If no focused key, then start from the root.
                if (!target) target = nextValidTarget(null, types, drag.allowedDropOperations, getNextTarget);
                localState.state.setTarget(target);
            },
            onDropExit () {
                (0, $4620ae0dc40f0031$exports.setDropCollectionRef)(undefined);
                localState.state.setTarget(null);
            },
            onDropTargetEnter (target) {
                localState.state.setTarget(target);
            },
            onDropActivate (e) {
                var _localState_state_target, _localState_state_target1;
                if (((_localState_state_target = localState.state.target) === null || _localState_state_target === void 0 ? void 0 : _localState_state_target.type) === 'item' && ((_localState_state_target1 = localState.state.target) === null || _localState_state_target1 === void 0 ? void 0 : _localState_state_target1.dropPosition) === 'on' && typeof localState.props.onDropActivate === 'function') localState.props.onDropActivate({
                    type: 'dropactivate',
                    x: e.x,
                    y: e.y,
                    target: localState.state.target
                });
            },
            onDrop (e, target) {
                (0, $4620ae0dc40f0031$exports.setDropCollectionRef)(ref);
                if (localState.state.target) onDrop(e, target || localState.state.target);
            },
            onKeyDown (e, drag) {
                let { keyboardDelegate: keyboardDelegate } = localState.props;
                let types = (0, $4620ae0dc40f0031$exports.getTypes)(drag.items);
                switch(e.key){
                    case 'ArrowDown':
                        if (keyboardDelegate.getKeyBelow) {
                            let target = nextValidTarget(localState.state.target, types, drag.allowedDropOperations, getNextTarget);
                            localState.state.setTarget(target);
                        }
                        break;
                    case 'ArrowUp':
                        if (keyboardDelegate.getKeyAbove) {
                            let target = nextValidTarget(localState.state.target, types, drag.allowedDropOperations, getPreviousTarget);
                            localState.state.setTarget(target);
                        }
                        break;
                    case 'ArrowLeft':
                        if (keyboardDelegate.getKeyLeftOf) {
                            let target = nextValidTarget(localState.state.target, types, drag.allowedDropOperations, (target, wrap)=>getPreviousTarget(target, wrap, true));
                            localState.state.setTarget(target);
                        }
                        break;
                    case 'ArrowRight':
                        if (keyboardDelegate.getKeyRightOf) {
                            let target = nextValidTarget(localState.state.target, types, drag.allowedDropOperations, (target, wrap)=>getNextTarget(target, wrap, true));
                            localState.state.setTarget(target);
                        }
                        break;
                    case 'Home':
                        if (keyboardDelegate.getFirstKey) {
                            let target = nextValidTarget(null, types, drag.allowedDropOperations, getNextTarget);
                            localState.state.setTarget(target);
                        }
                        break;
                    case 'End':
                        if (keyboardDelegate.getLastKey) {
                            let target = nextValidTarget(null, types, drag.allowedDropOperations, getPreviousTarget);
                            localState.state.setTarget(target);
                        }
                        break;
                    case 'PageDown':
                        if (keyboardDelegate.getKeyPageBelow) {
                            let target = localState.state.target;
                            if (!target) target = nextValidTarget(null, types, drag.allowedDropOperations, getNextTarget);
                            else {
                                var _keyboardDelegate_getFirstKey, _keyboardDelegate_getLastKey;
                                // If on the root, go to the item a page below the top. Otherwise a page below the current item.
                                let targetKey = (_keyboardDelegate_getFirstKey = keyboardDelegate.getFirstKey) === null || _keyboardDelegate_getFirstKey === void 0 ? void 0 : _keyboardDelegate_getFirstKey.call(keyboardDelegate);
                                if (target.type === 'item') targetKey = target.key;
                                let nextKey = null;
                                if (targetKey != null) nextKey = keyboardDelegate.getKeyPageBelow(targetKey);
                                let dropPosition = target.type === 'item' ? target.dropPosition : 'after';
                                // If there is no next key, or we are starting on the last key, jump to the last possible position.
                                if (nextKey == null || target.type === 'item' && target.key === ((_keyboardDelegate_getLastKey = keyboardDelegate.getLastKey) === null || _keyboardDelegate_getLastKey === void 0 ? void 0 : _keyboardDelegate_getLastKey.call(keyboardDelegate))) {
                                    var _keyboardDelegate_getLastKey1;
                                    var _keyboardDelegate_getLastKey2;
                                    nextKey = (_keyboardDelegate_getLastKey2 = (_keyboardDelegate_getLastKey1 = keyboardDelegate.getLastKey) === null || _keyboardDelegate_getLastKey1 === void 0 ? void 0 : _keyboardDelegate_getLastKey1.call(keyboardDelegate)) !== null && _keyboardDelegate_getLastKey2 !== void 0 ? _keyboardDelegate_getLastKey2 : null;
                                    dropPosition = 'after';
                                }
                                if (nextKey == null) break;
                                target = {
                                    type: 'item',
                                    key: nextKey,
                                    dropPosition: dropPosition
                                };
                                // If the target does not accept the drop, find the next valid target.
                                // If no next valid target, find the previous valid target.
                                let { draggingCollectionRef: draggingCollectionRef, draggingKeys: draggingKeys } = (0, $4620ae0dc40f0031$exports.globalDndState);
                                let isInternal = (draggingCollectionRef === null || draggingCollectionRef === void 0 ? void 0 : draggingCollectionRef.current) === (ref === null || ref === void 0 ? void 0 : ref.current);
                                let operation = localState.state.getDropOperation({
                                    target: target,
                                    types: types,
                                    allowedOperations: drag.allowedDropOperations,
                                    isInternal: isInternal,
                                    draggingKeys: draggingKeys
                                });
                                var _nextValidTarget;
                                if (operation === 'cancel') target = (_nextValidTarget = nextValidTarget(target, types, drag.allowedDropOperations, getNextTarget, false)) !== null && _nextValidTarget !== void 0 ? _nextValidTarget : nextValidTarget(target, types, drag.allowedDropOperations, getPreviousTarget, false);
                            }
                            localState.state.setTarget(target !== null && target !== void 0 ? target : localState.state.target);
                        }
                        break;
                    case 'PageUp':
                        {
                            if (!keyboardDelegate.getKeyPageAbove) break;
                            let target = localState.state.target;
                            if (!target) target = nextValidTarget(null, types, drag.allowedDropOperations, getPreviousTarget);
                            else if (target.type === 'item') {
                                var _keyboardDelegate_getFirstKey1;
                                // If at the top already, switch to the root. Otherwise navigate a page up.
                                if (target.key === ((_keyboardDelegate_getFirstKey1 = keyboardDelegate.getFirstKey) === null || _keyboardDelegate_getFirstKey1 === void 0 ? void 0 : _keyboardDelegate_getFirstKey1.call(keyboardDelegate))) target = {
                                    type: 'root'
                                };
                                else {
                                    let nextKey = keyboardDelegate.getKeyPageAbove(target.key);
                                    let dropPosition = target.dropPosition;
                                    if (nextKey == null) {
                                        var _keyboardDelegate_getFirstKey2;
                                        nextKey = (_keyboardDelegate_getFirstKey2 = keyboardDelegate.getFirstKey) === null || _keyboardDelegate_getFirstKey2 === void 0 ? void 0 : _keyboardDelegate_getFirstKey2.call(keyboardDelegate);
                                        dropPosition = 'before';
                                    }
                                    if (nextKey == null) break;
                                    target = {
                                        type: 'item',
                                        key: nextKey,
                                        dropPosition: dropPosition
                                    };
                                }
                                // If the target does not accept the drop, find the previous valid target.
                                // If no next valid target, find the next valid target.
                                let { draggingKeys: draggingKeys } = (0, $4620ae0dc40f0031$exports.globalDndState);
                                let isInternal = (0, $4620ae0dc40f0031$exports.isInternalDropOperation)(ref);
                                let operation = localState.state.getDropOperation({
                                    target: target,
                                    types: types,
                                    allowedOperations: drag.allowedDropOperations,
                                    isInternal: isInternal,
                                    draggingKeys: draggingKeys
                                });
                                var _nextValidTarget1;
                                if (operation === 'cancel') target = (_nextValidTarget1 = nextValidTarget(target, types, drag.allowedDropOperations, getPreviousTarget, false)) !== null && _nextValidTarget1 !== void 0 ? _nextValidTarget1 : nextValidTarget(target, types, drag.allowedDropOperations, getNextTarget, false);
                            }
                            localState.state.setTarget(target !== null && target !== void 0 ? target : localState.state.target);
                            break;
                        }
                }
            }
        });
    }, [
        localState,
        ref,
        onDrop,
        direction
    ]);
    let id = (0, $foOxf$reactariautils.useId)();
    (0, $4620ae0dc40f0031$exports.droppableCollectionMap).set(state, {
        id: id,
        ref: ref
    });
    return {
        collectionProps: (0, $foOxf$reactariautils.mergeProps)(dropProps, {
            id: id,
            // Remove description from collection element. If dropping on the entire collection,
            // there should be a drop indicator that has this description, so no need to double announce.
            'aria-describedby': null
        })
    };
}


//# sourceMappingURL=useDroppableCollection.main.js.map
