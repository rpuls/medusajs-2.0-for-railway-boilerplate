var $28e10663603f5ea1$exports = require("./DragManager.main.js");
var $4620ae0dc40f0031$exports = require("./utils.main.js");
var $419982e205c8e8dc$exports = require("./useVirtualDrop.main.js");
var $9Vk6V$react = require("react");


function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "useDroppableItem", () => $fc1876157e07bcec$export$f7b0c5d28b66b6a5);
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



function $fc1876157e07bcec$export$f7b0c5d28b66b6a5(options, state, ref) {
    let { dropProps: dropProps } = (0, $419982e205c8e8dc$exports.useVirtualDrop)();
    let droppableCollectionRef = (0, $4620ae0dc40f0031$exports.getDroppableCollectionRef)(state);
    (0, $9Vk6V$react.useEffect)(()=>{
        if (ref.current) return $28e10663603f5ea1$exports.registerDropItem({
            element: ref.current,
            target: options.target,
            getDropOperation (types, allowedOperations) {
                let { draggingKeys: draggingKeys } = (0, $4620ae0dc40f0031$exports.globalDndState);
                let isInternal = (0, $4620ae0dc40f0031$exports.isInternalDropOperation)(droppableCollectionRef);
                return state.getDropOperation({
                    target: options.target,
                    types: types,
                    allowedOperations: allowedOperations,
                    isInternal: isInternal,
                    draggingKeys: draggingKeys
                });
            }
        });
    }, [
        ref,
        options.target,
        state,
        droppableCollectionRef
    ]);
    let dragSession = $28e10663603f5ea1$exports.useDragSession();
    let { draggingKeys: draggingKeys } = (0, $4620ae0dc40f0031$exports.globalDndState);
    let isInternal = (0, $4620ae0dc40f0031$exports.isInternalDropOperation)(droppableCollectionRef);
    let isValidDropTarget = dragSession && state.getDropOperation({
        target: options.target,
        types: (0, $4620ae0dc40f0031$exports.getTypes)(dragSession.dragTarget.items),
        allowedOperations: dragSession.dragTarget.allowedDropOperations,
        isInternal: isInternal,
        draggingKeys: draggingKeys
    }) !== 'cancel';
    let isDropTarget = state.isDropTarget(options.target);
    (0, $9Vk6V$react.useEffect)(()=>{
        if (dragSession && isDropTarget && ref.current) ref.current.focus();
    }, [
        isDropTarget,
        dragSession,
        ref
    ]);
    return {
        dropProps: {
            ...dropProps,
            'aria-hidden': !dragSession || isValidDropTarget ? undefined : 'true'
        },
        isDropTarget: isDropTarget
    };
}


//# sourceMappingURL=useDroppableItem.main.js.map
