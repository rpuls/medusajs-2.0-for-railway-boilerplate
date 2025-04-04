import {gridMap as $1af922eb41e03c8f$export$e6235c0d09b995d0} from "./utils.module.js";
import {chain as $kA5if$chain} from "@react-aria/utils";
import {useSelectableItem as $kA5if$useSelectableItem} from "@react-aria/selection";

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


function $4159a7a9cbb0cc18$export$96357d5a73f686fa(props, state, ref) {
    var _node_props, _node_props1;
    let { node: node, isVirtualized: isVirtualized, shouldSelectOnPressUp: shouldSelectOnPressUp, onAction: onAction } = props;
    let { actions: actions } = (0, $1af922eb41e03c8f$export$e6235c0d09b995d0).get(state);
    let onRowAction = actions.onRowAction ? ()=>{
        var _actions_onRowAction;
        return (_actions_onRowAction = actions.onRowAction) === null || _actions_onRowAction === void 0 ? void 0 : _actions_onRowAction.call(actions, node.key);
    } : onAction;
    let { itemProps: itemProps, ...states } = (0, $kA5if$useSelectableItem)({
        selectionManager: state.selectionManager,
        key: node.key,
        ref: ref,
        isVirtualized: isVirtualized,
        shouldSelectOnPressUp: shouldSelectOnPressUp,
        onAction: onRowAction || (node === null || node === void 0 ? void 0 : (_node_props = node.props) === null || _node_props === void 0 ? void 0 : _node_props.onAction) ? (0, $kA5if$chain)(node === null || node === void 0 ? void 0 : (_node_props1 = node.props) === null || _node_props1 === void 0 ? void 0 : _node_props1.onAction, onRowAction) : undefined,
        isDisabled: state.collection.size === 0
    });
    let isSelected = state.selectionManager.isSelected(node.key);
    let rowProps = {
        role: 'row',
        'aria-selected': state.selectionManager.selectionMode !== 'none' ? isSelected : undefined,
        'aria-disabled': states.isDisabled || undefined,
        ...itemProps
    };
    if (isVirtualized) rowProps['aria-rowindex'] = node.index + 1; // aria-rowindex is 1 based
    return {
        rowProps: rowProps,
        ...states
    };
}


export {$4159a7a9cbb0cc18$export$96357d5a73f686fa as useGridRow};
//# sourceMappingURL=useGridRow.module.js.map
