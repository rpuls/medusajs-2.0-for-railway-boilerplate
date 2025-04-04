import {isAppleDevice as $jUnAJ$isAppleDevice, useId as $jUnAJ$useId} from "@react-aria/utils";

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
function $feb5ffebff200149$export$d3e3bd3e26688c04(e) {
    // Ctrl + Arrow Up/Arrow Down has a system wide meaning on macOS, so use Alt instead.
    // On Windows and Ubuntu, Alt + Space has a system wide meaning.
    return (0, $jUnAJ$isAppleDevice)() ? e.altKey : e.ctrlKey;
}
function $feb5ffebff200149$export$c3d8340acf92597f(collectionRef, key) {
    var _collectionRef_current, _collectionRef_current1;
    let selector = `[data-key="${CSS.escape(String(key))}"]`;
    let collection = (_collectionRef_current = collectionRef.current) === null || _collectionRef_current === void 0 ? void 0 : _collectionRef_current.dataset.collection;
    if (collection) selector = `[data-collection="${CSS.escape(collection)}"]${selector}`;
    return (_collectionRef_current1 = collectionRef.current) === null || _collectionRef_current1 === void 0 ? void 0 : _collectionRef_current1.querySelector(selector);
}
const $feb5ffebff200149$var$collectionMap = new WeakMap();
function $feb5ffebff200149$export$881eb0d9f3605d9d(collection) {
    let id = (0, $jUnAJ$useId)();
    $feb5ffebff200149$var$collectionMap.set(collection, id);
    return id;
}
function $feb5ffebff200149$export$6aeb1680a0ae8741(collection) {
    return $feb5ffebff200149$var$collectionMap.get(collection);
}


export {$feb5ffebff200149$export$d3e3bd3e26688c04 as isNonContiguousSelectionModifier, $feb5ffebff200149$export$c3d8340acf92597f as getItemElement, $feb5ffebff200149$export$881eb0d9f3605d9d as useCollectionId, $feb5ffebff200149$export$6aeb1680a0ae8741 as getCollectionId};
//# sourceMappingURL=utils.module.js.map
