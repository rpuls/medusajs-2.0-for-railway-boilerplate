import {useState as $3pPTd$useState} from "react";

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
function $be2ea0343af54212$export$d14e1352e21f4a16(options) {
    let { initialItems: initialItems = [], initialSelectedKeys: initialSelectedKeys, getKey: getKey = (item)=>{
        var _item_id;
        return (_item_id = item.id) !== null && _item_id !== void 0 ? _item_id : item.key;
    }, getChildren: getChildren = (item)=>item.children } = options;
    // We only want to compute this on initial render.
    let [tree, setItems] = (0, $3pPTd$useState)(()=>buildTree(initialItems, new Map()));
    let { items: items, nodeMap: nodeMap } = tree;
    let [selectedKeys, setSelectedKeys] = (0, $3pPTd$useState)(new Set(initialSelectedKeys || []));
    function buildTree(initialItems = [], map, parentKey) {
        if (initialItems == null) initialItems = [];
        return {
            items: initialItems.map((item)=>{
                let node = {
                    key: getKey(item),
                    parentKey: parentKey,
                    value: item,
                    children: null
                };
                node.children = buildTree(getChildren(item), map, node.key).items;
                map.set(node.key, node);
                return node;
            }),
            nodeMap: map
        };
    }
    function updateTree(items, key, update, originalMap) {
        let node = originalMap.get(key);
        if (!node) return {
            items: items,
            nodeMap: originalMap
        };
        let map = new Map(originalMap);
        // Create a new node. If null, then delete the node, otherwise replace.
        let newNode = update(node);
        if (newNode == null) deleteNode(node, map);
        else addNode(newNode, map);
        // Walk up the tree and update each parent to refer to the new children.
        while(node && node.parentKey){
            let nextParent = map.get(node.parentKey);
            let copy = {
                key: nextParent.key,
                parentKey: nextParent.parentKey,
                value: nextParent.value,
                children: null
            };
            let children = nextParent.children;
            if (newNode == null && children) children = children.filter((c)=>c !== node);
            var _children_map;
            copy.children = (_children_map = children === null || children === void 0 ? void 0 : children.map((child)=>{
                if (child === node) // newNode cannot be null here due to the above filter.
                return newNode;
                return child;
            })) !== null && _children_map !== void 0 ? _children_map : null;
            map.set(copy.key, copy);
            newNode = copy;
            node = nextParent;
        }
        if (newNode == null) items = items.filter((c)=>c !== node);
        return {
            items: items.map((item)=>{
                if (item === node) // newNode cannot be null here due to the above filter.
                return newNode;
                return item;
            }),
            nodeMap: map
        };
    }
    function addNode(node, map) {
        map.set(node.key, node);
        if (node.children) for (let child of node.children)addNode(child, map);
    }
    function deleteNode(node, map) {
        map.delete(node.key);
        if (node.children) for (let child of node.children)deleteNode(child, map);
    }
    return {
        items: items,
        selectedKeys: selectedKeys,
        setSelectedKeys: setSelectedKeys,
        getItem (key) {
            return nodeMap.get(key);
        },
        insert (parentKey, index, ...values) {
            setItems(({ items: items, nodeMap: originalMap })=>{
                let { items: newNodes, nodeMap: newMap } = buildTree(values, originalMap, parentKey);
                // If parentKey is null, insert into the root.
                if (parentKey == null) return {
                    items: [
                        ...items.slice(0, index),
                        ...newNodes,
                        ...items.slice(index)
                    ],
                    nodeMap: newMap
                };
                // Otherwise, update the parent node and its ancestors.
                return updateTree(items, parentKey, (parentNode)=>({
                        key: parentNode.key,
                        parentKey: parentNode.parentKey,
                        value: parentNode.value,
                        children: [
                            ...parentNode.children.slice(0, index),
                            ...newNodes,
                            ...parentNode.children.slice(index)
                        ]
                    }), newMap);
            });
        },
        insertBefore (key, ...values) {
            let node = nodeMap.get(key);
            if (!node) return;
            let parentNode = nodeMap.get(node.parentKey);
            let nodes = parentNode ? parentNode.children : items;
            let index = nodes.indexOf(node);
            var _parentNode_key;
            this.insert((_parentNode_key = parentNode === null || parentNode === void 0 ? void 0 : parentNode.key) !== null && _parentNode_key !== void 0 ? _parentNode_key : null, index, ...values);
        },
        insertAfter (key, ...values) {
            let node = nodeMap.get(key);
            if (!node) return;
            let parentNode = nodeMap.get(node.parentKey);
            let nodes = parentNode ? parentNode.children : items;
            let index = nodes.indexOf(node);
            var _parentNode_key;
            this.insert((_parentNode_key = parentNode === null || parentNode === void 0 ? void 0 : parentNode.key) !== null && _parentNode_key !== void 0 ? _parentNode_key : null, index + 1, ...values);
        },
        prepend (parentKey, ...values) {
            this.insert(parentKey, 0, ...values);
        },
        append (parentKey, ...values) {
            if (parentKey == null) this.insert(null, items.length, ...values);
            else {
                let parentNode = nodeMap.get(parentKey);
                if (!parentNode) return;
                this.insert(parentKey, parentNode.children.length, ...values);
            }
        },
        remove (...keys) {
            if (keys.length === 0) return;
            let newItems = items;
            let prevMap = nodeMap;
            let newTree;
            for (let key of keys){
                newTree = updateTree(newItems, key, ()=>null, prevMap);
                prevMap = newTree.nodeMap;
                newItems = newTree.items;
            }
            setItems(newTree);
            let selection = new Set(selectedKeys);
            for (let key of selectedKeys)if (!newTree.nodeMap.has(key)) selection.delete(key);
            setSelectedKeys(selection);
        },
        removeSelectedItems () {
            this.remove(...selectedKeys);
        },
        move (key, toParentKey, index) {
            setItems(({ items: items, nodeMap: originalMap })=>{
                let node = originalMap.get(key);
                if (!node) return {
                    items: items,
                    nodeMap: originalMap
                };
                let { items: newItems, nodeMap: newMap } = updateTree(items, key, ()=>null, originalMap);
                const movedNode = {
                    ...node,
                    parentKey: toParentKey
                };
                // If parentKey is null, insert into the root.
                if (toParentKey == null) {
                    newMap.set(movedNode.key, movedNode);
                    return {
                        items: [
                            ...newItems.slice(0, index),
                            movedNode,
                            ...newItems.slice(index)
                        ],
                        nodeMap: newMap
                    };
                }
                // Otherwise, update the parent node and its ancestors.
                return updateTree(newItems, toParentKey, (parentNode)=>({
                        key: parentNode.key,
                        parentKey: parentNode.parentKey,
                        value: parentNode.value,
                        children: [
                            ...parentNode.children.slice(0, index),
                            movedNode,
                            ...parentNode.children.slice(index)
                        ]
                    }), newMap);
            });
        },
        update (oldKey, newValue) {
            setItems(({ items: items, nodeMap: originalMap })=>updateTree(items, oldKey, (oldNode)=>{
                    let node = {
                        key: oldNode.key,
                        parentKey: oldNode.parentKey,
                        value: newValue,
                        children: null
                    };
                    let tree = buildTree(getChildren(newValue), originalMap, node.key);
                    node.children = tree.items;
                    return node;
                }, originalMap));
        }
    };
}


export {$be2ea0343af54212$export$d14e1352e21f4a16 as useTreeData};
//# sourceMappingURL=useTreeData.module.js.map
