import {TableCollection as $788781baa30117fa$export$596e1b2e2cf93690} from "./TableCollection.mjs";
import {useGridState as $1YSEb$useGridState} from "@react-stately/grid";
import {useState as $1YSEb$useState, useMemo as $1YSEb$useMemo, useCallback as $1YSEb$useCallback} from "react";
import {useCollection as $1YSEb$useCollection} from "@react-stately/collections";

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



const $4a0dd036d492cee4$var$OPPOSITE_SORT_DIRECTION = {
    ascending: 'descending',
    descending: 'ascending'
};
function $4a0dd036d492cee4$export$907bcc6c48325fd6(props) {
    let [isKeyboardNavigationDisabled, setKeyboardNavigationDisabled] = (0, $1YSEb$useState)(false);
    let { selectionMode: selectionMode = 'none', showSelectionCheckboxes: showSelectionCheckboxes, showDragButtons: showDragButtons } = props;
    let context = (0, $1YSEb$useMemo)(()=>({
            showSelectionCheckboxes: showSelectionCheckboxes && selectionMode !== 'none',
            showDragButtons: showDragButtons,
            selectionMode: selectionMode,
            columns: []
        }), [
        props.children,
        showSelectionCheckboxes,
        selectionMode,
        showDragButtons
    ]);
    let collection = (0, $1YSEb$useCollection)(props, (0, $1YSEb$useCallback)((nodes)=>new (0, $788781baa30117fa$export$596e1b2e2cf93690)(nodes, null, context), [
        context
    ]), context);
    let { disabledKeys: disabledKeys, selectionManager: selectionManager } = (0, $1YSEb$useGridState)({
        ...props,
        collection: collection,
        disabledBehavior: props.disabledBehavior || 'selection'
    });
    var _props_sortDescriptor;
    return {
        collection: collection,
        disabledKeys: disabledKeys,
        selectionManager: selectionManager,
        showSelectionCheckboxes: props.showSelectionCheckboxes || false,
        sortDescriptor: (_props_sortDescriptor = props.sortDescriptor) !== null && _props_sortDescriptor !== void 0 ? _props_sortDescriptor : null,
        isKeyboardNavigationDisabled: collection.size === 0 || isKeyboardNavigationDisabled,
        setKeyboardNavigationDisabled: setKeyboardNavigationDisabled,
        sort (columnKey, direction) {
            var _props_sortDescriptor, _props_onSortChange;
            (_props_onSortChange = props.onSortChange) === null || _props_onSortChange === void 0 ? void 0 : _props_onSortChange.call(props, {
                column: columnKey,
                direction: direction !== null && direction !== void 0 ? direction : ((_props_sortDescriptor = props.sortDescriptor) === null || _props_sortDescriptor === void 0 ? void 0 : _props_sortDescriptor.column) === columnKey ? $4a0dd036d492cee4$var$OPPOSITE_SORT_DIRECTION[props.sortDescriptor.direction] : 'ascending'
            });
        }
    };
}


export {$4a0dd036d492cee4$export$907bcc6c48325fd6 as useTableState};
//# sourceMappingURL=useTableState.module.js.map
