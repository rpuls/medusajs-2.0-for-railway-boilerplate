var $76b1e110a27b1ccd$exports = require("./constants.main.js");
var $1Le3E$reactariainteractions = require("@react-aria/interactions");


function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "droppableCollectionMap", () => $4620ae0dc40f0031$export$dfdf5deeaf27473f);
$parcel$export(module.exports, "DIRECTORY_DRAG_TYPE", () => $4620ae0dc40f0031$export$990fced5dfac2637);
$parcel$export(module.exports, "getDroppableCollectionId", () => $4620ae0dc40f0031$export$3093291712f09a77);
$parcel$export(module.exports, "getDroppableCollectionRef", () => $4620ae0dc40f0031$export$7e397efd01d3db27);
$parcel$export(module.exports, "getTypes", () => $4620ae0dc40f0031$export$e1d41611756c6326);
$parcel$export(module.exports, "useDragModality", () => $4620ae0dc40f0031$export$49bac5d6d4b352ea);
$parcel$export(module.exports, "getDragModality", () => $4620ae0dc40f0031$export$1fb2158d224b542c);
$parcel$export(module.exports, "writeToDataTransfer", () => $4620ae0dc40f0031$export$f9c1490890ddd063);
$parcel$export(module.exports, "DragTypes", () => $4620ae0dc40f0031$export$7f04ce188c91447c);
$parcel$export(module.exports, "readFromDataTransfer", () => $4620ae0dc40f0031$export$d9e760437831f8b3);
$parcel$export(module.exports, "isTextDropItem", () => $4620ae0dc40f0031$export$97fd558bdc44bea1);
$parcel$export(module.exports, "isFileDropItem", () => $4620ae0dc40f0031$export$a144e1752ebe0aa);
$parcel$export(module.exports, "isDirectoryDropItem", () => $4620ae0dc40f0031$export$2b40a62bdbe6b2b0);
$parcel$export(module.exports, "globalDndState", () => $4620ae0dc40f0031$export$6ca6700462636d0b);
$parcel$export(module.exports, "setDraggingCollectionRef", () => $4620ae0dc40f0031$export$f2be18a910c0caa6);
$parcel$export(module.exports, "setDraggingKeys", () => $4620ae0dc40f0031$export$72cb63bdda528276);
$parcel$export(module.exports, "setDropCollectionRef", () => $4620ae0dc40f0031$export$dac8db29d42db9a1);
$parcel$export(module.exports, "clearGlobalDnDState", () => $4620ae0dc40f0031$export$70936501603e6c57);
$parcel$export(module.exports, "setGlobalDnDState", () => $4620ae0dc40f0031$export$6c10d32b362bfa5f);
$parcel$export(module.exports, "isInternalDropOperation", () => $4620ae0dc40f0031$export$78bf638634500fa5);
$parcel$export(module.exports, "globalDropEffect", () => $4620ae0dc40f0031$export$8e6636520ac15722);
$parcel$export(module.exports, "setGlobalDropEffect", () => $4620ae0dc40f0031$export$64f52ed7349ddb84);
$parcel$export(module.exports, "globalAllowedDropOperations", () => $4620ae0dc40f0031$export$f0130eb70b6347b8);
$parcel$export(module.exports, "setGlobalAllowedDropOperations", () => $4620ae0dc40f0031$export$6539bc8c3a0a2d67);
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

const $4620ae0dc40f0031$export$dfdf5deeaf27473f = new WeakMap();
const $4620ae0dc40f0031$export$990fced5dfac2637 = Symbol();
function $4620ae0dc40f0031$export$3093291712f09a77(state) {
    let { id: id } = $4620ae0dc40f0031$export$dfdf5deeaf27473f.get(state) || {};
    if (!id) throw new Error('Droppable item outside a droppable collection');
    return id;
}
function $4620ae0dc40f0031$export$7e397efd01d3db27(state) {
    let { ref: ref } = $4620ae0dc40f0031$export$dfdf5deeaf27473f.get(state) || {};
    if (!ref) throw new Error('Droppable item outside a droppable collection');
    return ref;
}
function $4620ae0dc40f0031$export$e1d41611756c6326(items) {
    let types = new Set();
    for (let item of items)for (let type of Object.keys(item))types.add(type);
    return types;
}
function $4620ae0dc40f0031$var$mapModality(modality) {
    if (!modality) modality = 'virtual';
    if (modality === 'pointer') modality = 'virtual';
    if (modality === 'virtual' && typeof window !== 'undefined' && 'ontouchstart' in window) modality = 'touch';
    return modality;
}
function $4620ae0dc40f0031$export$49bac5d6d4b352ea() {
    return $4620ae0dc40f0031$var$mapModality((0, $1Le3E$reactariainteractions.useInteractionModality)());
}
function $4620ae0dc40f0031$export$1fb2158d224b542c() {
    return $4620ae0dc40f0031$var$mapModality((0, $1Le3E$reactariainteractions.getInteractionModality)());
}
function $4620ae0dc40f0031$export$f9c1490890ddd063(dataTransfer, items) {
    // The data transfer API doesn't support more than one item of a given type at once.
    // In addition, only a small set of types are supported natively for transfer between applications.
    // We allow for both multiple items, as well as multiple representations of a single item.
    // In order to make our API work with the native API, we serialize all items to JSON and
    // store as a single native item. We only need to do this if there is more than one item
    // of the same type, or if an item has more than one representation. Otherwise the native
    // API is sufficient.
    //
    // The DataTransferItemList API also theoretically supports adding files, which would enable
    // dragging binary data out of the browser onto the user's desktop for example. Unfortunately,
    // this does not currently work in any browser, so it is not currently supported by our API.
    // See e.g. https://bugs.chromium.org/p/chromium/issues/detail?id=438479.
    let groupedByType = new Map();
    let needsCustomData = false;
    let customData = [];
    for (let item of items){
        let types = Object.keys(item);
        if (types.length > 1) needsCustomData = true;
        let dataByType = {};
        for (let type of types){
            let typeItems = groupedByType.get(type);
            if (!typeItems) {
                typeItems = [];
                groupedByType.set(type, typeItems);
            } else needsCustomData = true;
            let data = item[type];
            dataByType[type] = data;
            typeItems.push(data);
        }
        customData.push(dataByType);
    }
    for (let [type, items] of groupedByType)if ((0, $76b1e110a27b1ccd$exports.NATIVE_DRAG_TYPES).has(type)) {
        // Only one item of a given type can be set on a data transfer.
        // Join all of the items together separated by newlines.
        let data = items.join('\n');
        dataTransfer.items.add(data, type);
    } else // Set data to the first item so we have access to the list of types.
    dataTransfer.items.add(items[0], type);
    if (needsCustomData) {
        let data = JSON.stringify(customData);
        dataTransfer.items.add(data, (0, $76b1e110a27b1ccd$exports.CUSTOM_DRAG_TYPE));
    }
}
class $4620ae0dc40f0031$export$7f04ce188c91447c {
    has(type) {
        if (this.includesUnknownTypes || type === $4620ae0dc40f0031$export$990fced5dfac2637 && this.types.has((0, $76b1e110a27b1ccd$exports.GENERIC_TYPE))) return true;
        return typeof type === 'string' && this.types.has(type);
    }
    constructor(dataTransfer){
        this.types = new Set();
        let hasFiles = false;
        for (let item of dataTransfer.items)if (item.type !== (0, $76b1e110a27b1ccd$exports.CUSTOM_DRAG_TYPE)) {
            if (item.kind === 'file') hasFiles = true;
            if (item.type) this.types.add(item.type);
            else // Files with unknown types or extensions that don't map to a known mime type
            // are sometimes exposed as an empty string by the browser. Map to a generic
            // mime type instead. Note that this could also be a directory as there's no
            // way to determine if something is a file or directory until drop.
            this.types.add((0, $76b1e110a27b1ccd$exports.GENERIC_TYPE));
        }
        // In Safari, when dragging files, the dataTransfer.items list is empty, but dataTransfer.types contains "Files".
        // Unfortunately, this doesn't tell us what types of files the user is dragging, so we need to assume that any
        // type the user checks for is included. See https://bugs.webkit.org/show_bug.cgi?id=223517.
        this.includesUnknownTypes = !hasFiles && dataTransfer.types.includes('Files');
    }
}
function $4620ae0dc40f0031$export$d9e760437831f8b3(dataTransfer) {
    let items = [];
    if (!dataTransfer) return items;
    // If our custom drag type is available, use that. This is a JSON serialized
    // representation of all items in the drag, set when there are multiple items
    // of the same type, or an individual item has multiple representations.
    let hasCustomType = false;
    if (dataTransfer.types.includes((0, $76b1e110a27b1ccd$exports.CUSTOM_DRAG_TYPE))) try {
        let data = dataTransfer.getData((0, $76b1e110a27b1ccd$exports.CUSTOM_DRAG_TYPE));
        let parsed = JSON.parse(data);
        for (let item of parsed)items.push({
            kind: 'text',
            types: new Set(Object.keys(item)),
            getText: (type)=>Promise.resolve(item[type])
        });
        hasCustomType = true;
    } catch  {
    // ignore
    }
    // Otherwise, map native drag items to items of a single representation.
    if (!hasCustomType) {
        let stringItems = new Map();
        for (let item of dataTransfer.items){
            if (item.kind === 'string') // The data for all formats must be read here because the data transfer gets
            // cleared out after the event handler finishes. If the item has an empty string
            // as a type, the mime type is unknown. Map to a generic mime type instead.
            stringItems.set(item.type || (0, $76b1e110a27b1ccd$exports.GENERIC_TYPE), dataTransfer.getData(item.type));
            else if (item.kind === 'file') {
                // Despite the name, webkitGetAsEntry is also implemented in Firefox and Edge.
                // In the future, we may use getAsFileSystemHandle instead, but that's currently
                // only implemented in Chrome.
                if (typeof item.webkitGetAsEntry === 'function') {
                    let entry = item.webkitGetAsEntry();
                    // eslint-disable-next-line max-depth
                    if (!entry) continue;
                    // eslint-disable-next-line max-depth
                    if (entry.isFile) items.push($4620ae0dc40f0031$var$createFileItem(item.getAsFile()));
                    else if (entry.isDirectory) items.push($4620ae0dc40f0031$var$createDirectoryItem(entry));
                } else // Assume it's a file.
                items.push($4620ae0dc40f0031$var$createFileItem(item.getAsFile()));
            }
        }
        // All string items are different representations of the same item. There's no way to have
        // multiple string items at once in the current DataTransfer API.
        if (stringItems.size > 0) items.push({
            kind: 'text',
            types: new Set(stringItems.keys()),
            getText: (type)=>Promise.resolve(stringItems.get(type))
        });
    }
    return items;
}
function $4620ae0dc40f0031$var$blobToString(blob) {
    if (typeof blob.text === 'function') return blob.text();
    // Safari doesn't have the Blob#text() method yet...
    return new Promise((resolve, reject)=>{
        let reader = new FileReader;
        reader.onload = ()=>{
            resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsText(blob);
    });
}
function $4620ae0dc40f0031$var$createFileItem(file) {
    if (!file) throw new Error('No file provided');
    return {
        kind: 'file',
        type: file.type || (0, $76b1e110a27b1ccd$exports.GENERIC_TYPE),
        name: file.name,
        getText: ()=>$4620ae0dc40f0031$var$blobToString(file),
        getFile: ()=>Promise.resolve(file)
    };
}
function $4620ae0dc40f0031$var$createDirectoryItem(entry) {
    return {
        kind: 'directory',
        name: entry.name,
        getEntries: ()=>$4620ae0dc40f0031$var$getEntries(entry)
    };
}
async function* $4620ae0dc40f0031$var$getEntries(item) {
    let reader = item.createReader();
    // We must call readEntries repeatedly because there may be a limit to the
    // number of entries that are returned at once.
    let entries;
    do {
        entries = await new Promise((resolve, reject)=>{
            reader.readEntries(resolve, reject);
        });
        for (let entry of entries){
            if (entry.isFile) {
                let file = await $4620ae0dc40f0031$var$getEntryFile(entry);
                yield $4620ae0dc40f0031$var$createFileItem(file);
            } else if (entry.isDirectory) yield $4620ae0dc40f0031$var$createDirectoryItem(entry);
        }
    }while (entries.length > 0);
}
function $4620ae0dc40f0031$var$getEntryFile(entry) {
    return new Promise((resolve, reject)=>entry.file(resolve, reject));
}
function $4620ae0dc40f0031$export$97fd558bdc44bea1(dropItem) {
    return dropItem.kind === 'text';
}
function $4620ae0dc40f0031$export$a144e1752ebe0aa(dropItem) {
    return dropItem.kind === 'file';
}
function $4620ae0dc40f0031$export$2b40a62bdbe6b2b0(dropItem) {
    return dropItem.kind === 'directory';
}
let $4620ae0dc40f0031$export$6ca6700462636d0b = {
    draggingKeys: new Set()
};
function $4620ae0dc40f0031$export$f2be18a910c0caa6(ref) {
    $4620ae0dc40f0031$export$6ca6700462636d0b.draggingCollectionRef = ref;
}
function $4620ae0dc40f0031$export$72cb63bdda528276(keys) {
    $4620ae0dc40f0031$export$6ca6700462636d0b.draggingKeys = keys;
}
function $4620ae0dc40f0031$export$dac8db29d42db9a1(ref) {
    $4620ae0dc40f0031$export$6ca6700462636d0b.dropCollectionRef = ref;
}
function $4620ae0dc40f0031$export$70936501603e6c57() {
    $4620ae0dc40f0031$export$6ca6700462636d0b = {
        draggingKeys: new Set()
    };
}
function $4620ae0dc40f0031$export$6c10d32b362bfa5f(state) {
    $4620ae0dc40f0031$export$6ca6700462636d0b = state;
}
function $4620ae0dc40f0031$export$78bf638634500fa5(ref) {
    let { draggingCollectionRef: draggingCollectionRef, dropCollectionRef: dropCollectionRef } = $4620ae0dc40f0031$export$6ca6700462636d0b;
    return (draggingCollectionRef === null || draggingCollectionRef === void 0 ? void 0 : draggingCollectionRef.current) != null && draggingCollectionRef.current === ((ref === null || ref === void 0 ? void 0 : ref.current) || (dropCollectionRef === null || dropCollectionRef === void 0 ? void 0 : dropCollectionRef.current));
}
let $4620ae0dc40f0031$export$8e6636520ac15722;
function $4620ae0dc40f0031$export$64f52ed7349ddb84(dropEffect) {
    $4620ae0dc40f0031$export$8e6636520ac15722 = dropEffect;
}
let $4620ae0dc40f0031$export$f0130eb70b6347b8 = (0, $76b1e110a27b1ccd$exports.DROP_OPERATION).none;
function $4620ae0dc40f0031$export$6539bc8c3a0a2d67(o) {
    $4620ae0dc40f0031$export$f0130eb70b6347b8 = o;
}


//# sourceMappingURL=utils.main.js.map
