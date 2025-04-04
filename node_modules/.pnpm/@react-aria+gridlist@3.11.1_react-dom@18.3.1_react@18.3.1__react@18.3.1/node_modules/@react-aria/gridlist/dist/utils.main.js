
function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "listMap", () => $7db02799adae605d$export$5b9bb410392e3991);
$parcel$export(module.exports, "getRowId", () => $7db02799adae605d$export$f45c25170b9a99c2);
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
 */ const $7db02799adae605d$export$5b9bb410392e3991 = new WeakMap();
function $7db02799adae605d$export$f45c25170b9a99c2(state, key) {
    var _listMap_get;
    let { id: id } = (_listMap_get = $7db02799adae605d$export$5b9bb410392e3991.get(state)) !== null && _listMap_get !== void 0 ? _listMap_get : {};
    if (!id) throw new Error('Unknown list');
    return `${id}-${$7db02799adae605d$export$e0c709538cb8ae18(key)}`;
}
function $7db02799adae605d$export$e0c709538cb8ae18(key) {
    if (typeof key === 'string') return key.replace(/\s*/g, '');
    return '' + key;
}


//# sourceMappingURL=utils.main.js.map
