var $6acf696f746f932c$exports = require("./utils.main.js");
var $6RVcf$reactstatelycollections = require("@react-stately/collections");
var $6RVcf$reactariagrid = require("@react-aria/grid");
var $6RVcf$reactariautils = require("@react-aria/utils");
var $6RVcf$reactstatelyflags = require("@react-stately/flags");
var $6RVcf$reactariai18n = require("@react-aria/i18n");


function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "useTableRow", () => $10b2115217af7c93$export$7f2f6ae19e707aa5);
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





const $10b2115217af7c93$var$EXPANSION_KEYS = {
    expand: {
        ltr: 'ArrowRight',
        rtl: 'ArrowLeft'
    },
    'collapse': {
        ltr: 'ArrowLeft',
        rtl: 'ArrowRight'
    }
};
function $10b2115217af7c93$export$7f2f6ae19e707aa5(props, state, ref) {
    let { node: node, isVirtualized: isVirtualized } = props;
    let { rowProps: rowProps, ...states } = (0, $6RVcf$reactariagrid.useGridRow)(props, state, ref);
    let { direction: direction } = (0, $6RVcf$reactariai18n.useLocale)();
    if (isVirtualized && !((0, $6RVcf$reactstatelyflags.tableNestedRows)() && 'expandedKeys' in state)) rowProps['aria-rowindex'] = node.index + 1 + state.collection.headerRows.length; // aria-rowindex is 1 based
    else delete rowProps['aria-rowindex'];
    let treeGridRowProps = {};
    if ((0, $6RVcf$reactstatelyflags.tableNestedRows)() && 'expandedKeys' in state) {
        let treeNode = state.keyMap.get(node.key);
        if (treeNode != null) {
            var _treeNode_props, _treeNode_props_children, _treeNode_props1, _getLastItem, _state_keyMap_get, _getLastItem1;
            let hasChildRows = ((_treeNode_props = treeNode.props) === null || _treeNode_props === void 0 ? void 0 : _treeNode_props.UNSTABLE_childItems) || ((_treeNode_props1 = treeNode.props) === null || _treeNode_props1 === void 0 ? void 0 : (_treeNode_props_children = _treeNode_props1.children) === null || _treeNode_props_children === void 0 ? void 0 : _treeNode_props_children.length) > state.userColumnCount;
            var _treeNode_indexOfType, _state_keyMap_get_childNodes, _getLastItem_indexOfType, _getLastItem_indexOfType1;
            treeGridRowProps = {
                onKeyDown: (e)=>{
                    if (e.key === $10b2115217af7c93$var$EXPANSION_KEYS['expand'][direction] && state.selectionManager.focusedKey === treeNode.key && hasChildRows && state.expandedKeys !== 'all' && !state.expandedKeys.has(treeNode.key)) {
                        state.toggleKey(treeNode.key);
                        e.stopPropagation();
                    } else if (e.key === $10b2115217af7c93$var$EXPANSION_KEYS['collapse'][direction] && state.selectionManager.focusedKey === treeNode.key && hasChildRows && (state.expandedKeys === 'all' || state.expandedKeys.has(treeNode.key))) {
                        state.toggleKey(treeNode.key);
                        e.stopPropagation();
                    }
                },
                'aria-expanded': hasChildRows ? state.expandedKeys === 'all' || state.expandedKeys.has(node.key) : undefined,
                'aria-level': treeNode.level,
                'aria-posinset': ((_treeNode_indexOfType = treeNode.indexOfType) !== null && _treeNode_indexOfType !== void 0 ? _treeNode_indexOfType : 0) + 1,
                'aria-setsize': treeNode.level > 1 ? ((_getLastItem_indexOfType = (_getLastItem = (0, $6RVcf$reactstatelycollections.getLastItem)((_state_keyMap_get_childNodes = (_state_keyMap_get = state.keyMap.get(treeNode.parentKey)) === null || _state_keyMap_get === void 0 ? void 0 : _state_keyMap_get.childNodes) !== null && _state_keyMap_get_childNodes !== void 0 ? _state_keyMap_get_childNodes : [])) === null || _getLastItem === void 0 ? void 0 : _getLastItem.indexOfType) !== null && _getLastItem_indexOfType !== void 0 ? _getLastItem_indexOfType : 0) + 1 : ((_getLastItem_indexOfType1 = (_getLastItem1 = (0, $6RVcf$reactstatelycollections.getLastItem)(state.collection.body.childNodes)) === null || _getLastItem1 === void 0 ? void 0 : _getLastItem1.indexOfType) !== null && _getLastItem_indexOfType1 !== void 0 ? _getLastItem_indexOfType1 : 0) + 1
            };
        }
    }
    let syntheticLinkProps = (0, $6RVcf$reactariautils.useSyntheticLinkProps)(node.props);
    let linkProps = states.hasAction ? syntheticLinkProps : {};
    return {
        rowProps: {
            ...(0, $6RVcf$reactariautils.mergeProps)(rowProps, treeGridRowProps, linkProps),
            'aria-labelledby': (0, $6acf696f746f932c$exports.getRowLabelledBy)(state, node.key)
        },
        ...states
    };
}


//# sourceMappingURL=useTableRow.main.js.map
