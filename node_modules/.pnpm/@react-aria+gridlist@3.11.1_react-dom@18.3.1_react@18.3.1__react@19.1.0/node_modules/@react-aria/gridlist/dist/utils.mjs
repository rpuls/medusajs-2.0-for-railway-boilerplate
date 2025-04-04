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
 */ const $ce9b18daab526bbd$export$5b9bb410392e3991 = new WeakMap();
function $ce9b18daab526bbd$export$f45c25170b9a99c2(state, key) {
    var _listMap_get;
    let { id: id } = (_listMap_get = $ce9b18daab526bbd$export$5b9bb410392e3991.get(state)) !== null && _listMap_get !== void 0 ? _listMap_get : {};
    if (!id) throw new Error('Unknown list');
    return `${id}-${$ce9b18daab526bbd$export$e0c709538cb8ae18(key)}`;
}
function $ce9b18daab526bbd$export$e0c709538cb8ae18(key) {
    if (typeof key === 'string') return key.replace(/\s*/g, '');
    return '' + key;
}


export {$ce9b18daab526bbd$export$5b9bb410392e3991 as listMap, $ce9b18daab526bbd$export$f45c25170b9a99c2 as getRowId, $ce9b18daab526bbd$export$e0c709538cb8ae18 as normalizeKey};
//# sourceMappingURL=utils.module.js.map
