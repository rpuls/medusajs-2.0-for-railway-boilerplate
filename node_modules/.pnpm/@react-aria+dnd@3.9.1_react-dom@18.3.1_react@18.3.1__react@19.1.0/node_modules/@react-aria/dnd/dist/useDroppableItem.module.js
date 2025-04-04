import {registerDropItem as $67560de7c78cb232$export$aef80212ac99c003, useDragSession as $67560de7c78cb232$export$418e185dd3f1b968} from "./DragManager.module.js";
import {getDroppableCollectionRef as $7252cd45fc48c07c$export$7e397efd01d3db27, getTypes as $7252cd45fc48c07c$export$e1d41611756c6326, globalDndState as $7252cd45fc48c07c$export$6ca6700462636d0b, isInternalDropOperation as $7252cd45fc48c07c$export$78bf638634500fa5} from "./utils.module.js";
import {useVirtualDrop as $224594fe3e57ff1e$export$62447ad3d2ec7da6} from "./useVirtualDrop.module.js";
import {useEffect as $iZAZb$useEffect} from "react";

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



function $bfaab576ce1c580e$export$f7b0c5d28b66b6a5(options, state, ref) {
    let { dropProps: dropProps } = (0, $224594fe3e57ff1e$export$62447ad3d2ec7da6)();
    let droppableCollectionRef = (0, $7252cd45fc48c07c$export$7e397efd01d3db27)(state);
    (0, $iZAZb$useEffect)(()=>{
        if (ref.current) return $67560de7c78cb232$export$aef80212ac99c003({
            element: ref.current,
            target: options.target,
            getDropOperation (types, allowedOperations) {
                let { draggingKeys: draggingKeys } = (0, $7252cd45fc48c07c$export$6ca6700462636d0b);
                let isInternal = (0, $7252cd45fc48c07c$export$78bf638634500fa5)(droppableCollectionRef);
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
    let dragSession = $67560de7c78cb232$export$418e185dd3f1b968();
    let { draggingKeys: draggingKeys } = (0, $7252cd45fc48c07c$export$6ca6700462636d0b);
    let isInternal = (0, $7252cd45fc48c07c$export$78bf638634500fa5)(droppableCollectionRef);
    let isValidDropTarget = dragSession && state.getDropOperation({
        target: options.target,
        types: (0, $7252cd45fc48c07c$export$e1d41611756c6326)(dragSession.dragTarget.items),
        allowedOperations: dragSession.dragTarget.allowedDropOperations,
        isInternal: isInternal,
        draggingKeys: draggingKeys
    }) !== 'cancel';
    let isDropTarget = state.isDropTarget(options.target);
    (0, $iZAZb$useEffect)(()=>{
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


export {$bfaab576ce1c580e$export$f7b0c5d28b66b6a5 as useDroppableItem};
//# sourceMappingURL=useDroppableItem.module.js.map
