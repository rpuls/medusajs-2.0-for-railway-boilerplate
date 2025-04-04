var $7a155683b0d79a6a$exports = require("./getChildNodes.main.js");


function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "getItemCount", () => $e749fe52977fe2c2$export$77d5aafae4e095b2);
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
const $e749fe52977fe2c2$var$cache = new WeakMap();
function $e749fe52977fe2c2$export$77d5aafae4e095b2(collection) {
    let count = $e749fe52977fe2c2$var$cache.get(collection);
    if (count != null) return count;
    // TS isn't smart enough to know we've ensured count is a number, so use a new variable
    let counter = 0;
    let countItems = (items)=>{
        for (let item of items)if (item.type === 'section') countItems((0, $7a155683b0d79a6a$exports.getChildNodes)(item, collection));
        else counter++;
    };
    countItems(collection);
    $e749fe52977fe2c2$var$cache.set(collection, counter);
    return counter;
}


//# sourceMappingURL=getItemCount.main.js.map
