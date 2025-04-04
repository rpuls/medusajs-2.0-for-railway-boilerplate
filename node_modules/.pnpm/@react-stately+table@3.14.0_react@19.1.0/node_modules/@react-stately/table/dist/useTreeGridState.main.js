var $7f5a58334d8866a5$exports = require("./TableCollection.main.js");
var $e3f7784147dde23d$exports = require("./useTableState.main.js");
var $5Qo8l$reactstatelycollections = require("@react-stately/collections");
var $5Qo8l$react = require("react");
var $5Qo8l$reactstatelyflags = require("@react-stately/flags");
var $5Qo8l$reactstatelyutils = require("@react-stately/utils");


function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "UNSTABLE_useTreeGridState", () => $ed4e0b68b470dcfd$export$34dfa8a1622185a4);
/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */ 





function $ed4e0b68b470dcfd$export$34dfa8a1622185a4(props) {
    let { selectionMode: selectionMode = 'none', showSelectionCheckboxes: showSelectionCheckboxes, showDragButtons: showDragButtons, UNSTABLE_expandedKeys: propExpandedKeys, UNSTABLE_defaultExpandedKeys: propDefaultExpandedKeys, UNSTABLE_onExpandedChange: UNSTABLE_onExpandedChange, children: children } = props;
    if (!(0, $5Qo8l$reactstatelyflags.tableNestedRows)()) throw new Error('Feature flag for table nested rows must be enabled to use useTreeGridState.');
    let [expandedKeys, setExpandedKeys] = (0, $5Qo8l$reactstatelyutils.useControlledState)(propExpandedKeys ? $ed4e0b68b470dcfd$var$convertExpanded(propExpandedKeys) : undefined, propDefaultExpandedKeys ? $ed4e0b68b470dcfd$var$convertExpanded(propDefaultExpandedKeys) : new Set(), UNSTABLE_onExpandedChange);
    let context = (0, $5Qo8l$react.useMemo)(()=>({
            showSelectionCheckboxes: showSelectionCheckboxes && selectionMode !== 'none',
            showDragButtons: showDragButtons,
            selectionMode: selectionMode,
            columns: []
        }), [
        children,
        showSelectionCheckboxes,
        selectionMode,
        showDragButtons
    ]);
    let builder = (0, $5Qo8l$react.useMemo)(()=>new (0, $5Qo8l$reactstatelycollections.CollectionBuilder)(), []);
    let nodes = (0, $5Qo8l$react.useMemo)(()=>builder.build({
            children: children
        }, context), [
        builder,
        children,
        context
    ]);
    let treeGridCollection = (0, $5Qo8l$react.useMemo)(()=>{
        return $ed4e0b68b470dcfd$var$generateTreeGridCollection(nodes, {
            showSelectionCheckboxes: showSelectionCheckboxes,
            showDragButtons: showDragButtons,
            expandedKeys: expandedKeys
        });
    }, [
        nodes,
        showSelectionCheckboxes,
        showDragButtons,
        expandedKeys
    ]);
    let onToggle = (key)=>{
        setExpandedKeys($ed4e0b68b470dcfd$var$toggleKey(expandedKeys, key, treeGridCollection));
    };
    let collection = (0, $5Qo8l$react.useMemo)(()=>{
        return new (0, $7f5a58334d8866a5$exports.TableCollection)(treeGridCollection.tableNodes, null, context);
    }, [
        context,
        treeGridCollection.tableNodes
    ]);
    let tableState = (0, $e3f7784147dde23d$exports.useTableState)({
        ...props,
        collection: collection
    });
    return {
        ...tableState,
        keyMap: treeGridCollection.keyMap,
        userColumnCount: treeGridCollection.userColumnCount,
        expandedKeys: expandedKeys,
        toggleKey: onToggle
    };
}
function $ed4e0b68b470dcfd$var$toggleKey(currentExpandedKeys, key, collection) {
    let updatedExpandedKeys;
    if (currentExpandedKeys === 'all') {
        updatedExpandedKeys = new Set(collection.flattenedRows.filter((row)=>row.props.UNSTABLE_childItems || row.props.children.length > collection.userColumnCount).map((row)=>row.key));
        updatedExpandedKeys.delete(key);
    } else {
        updatedExpandedKeys = new Set(currentExpandedKeys);
        if (updatedExpandedKeys.has(key)) updatedExpandedKeys.delete(key);
        else updatedExpandedKeys.add(key);
    }
    return updatedExpandedKeys;
}
function $ed4e0b68b470dcfd$var$convertExpanded(expanded) {
    if (!expanded) return new Set();
    return expanded === 'all' ? 'all' : new Set(expanded);
}
function $ed4e0b68b470dcfd$var$generateTreeGridCollection(nodes, opts) {
    let { expandedKeys: expandedKeys = new Set() } = opts;
    let body = null;
    let flattenedRows = [];
    let columnCount = 0;
    let userColumnCount = 0;
    let originalColumns = [];
    let keyMap = new Map();
    if (opts === null || opts === void 0 ? void 0 : opts.showSelectionCheckboxes) columnCount++;
    if (opts === null || opts === void 0 ? void 0 : opts.showDragButtons) columnCount++;
    let topLevelRows = [];
    let visit = (node)=>{
        switch(node.type){
            case 'body':
                body = node;
                keyMap.set(body.key, body);
                break;
            case 'column':
                if (!node.hasChildNodes) userColumnCount++;
                break;
            case 'item':
                topLevelRows.push(node);
                return;
        }
        for (let child of node.childNodes)visit(child);
    };
    for (let node of nodes){
        if (node.type === 'column') originalColumns.push(node);
        visit(node);
    }
    columnCount += userColumnCount;
    // Update each grid node in the treegrid table with values specific to a treegrid structure. Also store a set of flattened row nodes for TableCollection to consume
    let globalRowCount = 0;
    let visitNode = (node, i)=>{
        // Clone row node and its children so modifications to the node for treegrid specific values aren't applied on the nodes provided
        // to TableCollection. Index, level, and parent keys are all changed to reflect a flattened row structure rather than the treegrid structure
        // values automatically calculated via CollectionBuilder
        if (node.type === 'item') {
            let childNodes = [];
            for (let child of node.childNodes)if (child.type === 'cell') {
                let cellClone = {
                    ...child
                };
                if (cellClone.index + 1 === columnCount) cellClone.nextKey = null;
                childNodes.push({
                    ...cellClone
                });
            }
            let clone = {
                ...node,
                childNodes: childNodes,
                parentKey: body.key,
                level: 1,
                index: globalRowCount++
            };
            flattenedRows.push(clone);
        }
        let newProps = {};
        // Assign indexOfType to cells and rows for aria-posinset
        if (node.type !== 'placeholder' && node.type !== 'column') newProps['indexOfType'] = i;
        // Use Object.assign instead of spread to preserve object reference for keyMap. Also ensures retrieving nodes
        // via .childNodes returns the same object as the one found via keyMap look up
        Object.assign(node, newProps);
        keyMap.set(node.key, node);
        let lastNode = null;
        let rowIndex = 0;
        for (let child of node.childNodes)if (!(child.type === 'item' && expandedKeys !== 'all' && !expandedKeys.has(node.key))) {
            if (child.parentKey == null) // if child is a cell/expanded row/column and the parent key isn't already established by the collection, match child node to parent row
            child.parentKey = node.key;
            if (lastNode) {
                lastNode.nextKey = child.key;
                child.prevKey = lastNode.key;
            } else child.prevKey = null;
            if (child.type === 'item') visitNode(child, rowIndex++);
            else // We enforce that the cells come before rows so can just reuse cell index
            visitNode(child, child.index);
            lastNode = child;
        }
        if (lastNode) lastNode.nextKey = null;
    };
    let last = null;
    for (let [i, node] of topLevelRows.entries()){
        visitNode(node, i);
        if (last) {
            last.nextKey = node.key;
            node.prevKey = last.key;
        } else node.prevKey = null;
        last = node;
    }
    if (last) last.nextKey = null;
    return {
        keyMap: keyMap,
        userColumnCount: userColumnCount,
        flattenedRows: flattenedRows,
        tableNodes: [
            ...originalColumns,
            {
                ...body,
                childNodes: flattenedRows
            }
        ]
    };
}


//# sourceMappingURL=useTreeGridState.main.js.map
