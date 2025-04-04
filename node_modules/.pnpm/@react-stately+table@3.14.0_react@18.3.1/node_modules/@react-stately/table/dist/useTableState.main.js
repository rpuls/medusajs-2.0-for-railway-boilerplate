var $7f5a58334d8866a5$exports = require("./TableCollection.main.js");
var $hkaUn$reactstatelygrid = require("@react-stately/grid");
var $hkaUn$react = require("react");
var $hkaUn$reactstatelycollections = require("@react-stately/collections");


function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "useTableState", () => $e3f7784147dde23d$export$907bcc6c48325fd6);
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



const $e3f7784147dde23d$var$OPPOSITE_SORT_DIRECTION = {
    ascending: 'descending',
    descending: 'ascending'
};
function $e3f7784147dde23d$export$907bcc6c48325fd6(props) {
    let [isKeyboardNavigationDisabled, setKeyboardNavigationDisabled] = (0, $hkaUn$react.useState)(false);
    let { selectionMode: selectionMode = 'none', showSelectionCheckboxes: showSelectionCheckboxes, showDragButtons: showDragButtons } = props;
    let context = (0, $hkaUn$react.useMemo)(()=>({
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
    let collection = (0, $hkaUn$reactstatelycollections.useCollection)(props, (0, $hkaUn$react.useCallback)((nodes)=>new (0, $7f5a58334d8866a5$exports.TableCollection)(nodes, null, context), [
        context
    ]), context);
    let { disabledKeys: disabledKeys, selectionManager: selectionManager } = (0, $hkaUn$reactstatelygrid.useGridState)({
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
                direction: direction !== null && direction !== void 0 ? direction : ((_props_sortDescriptor = props.sortDescriptor) === null || _props_sortDescriptor === void 0 ? void 0 : _props_sortDescriptor.column) === columnKey ? $e3f7784147dde23d$var$OPPOSITE_SORT_DIRECTION[props.sortDescriptor.direction] : 'ascending'
            });
        }
    };
}


//# sourceMappingURL=useTableState.main.js.map
