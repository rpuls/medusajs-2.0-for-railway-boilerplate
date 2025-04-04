import {getChildNodes as $c5a24bc478652b5f$export$1005530eda016c13} from "./getChildNodes.mjs";

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
const $453cc9f0df89c0a5$var$cache = new WeakMap();
function $453cc9f0df89c0a5$export$77d5aafae4e095b2(collection) {
    let count = $453cc9f0df89c0a5$var$cache.get(collection);
    if (count != null) return count;
    // TS isn't smart enough to know we've ensured count is a number, so use a new variable
    let counter = 0;
    let countItems = (items)=>{
        for (let item of items)if (item.type === 'section') countItems((0, $c5a24bc478652b5f$export$1005530eda016c13)(item, collection));
        else counter++;
    };
    countItems(collection);
    $453cc9f0df89c0a5$var$cache.set(collection, counter);
    return counter;
}


export {$453cc9f0df89c0a5$export$77d5aafae4e095b2 as getItemCount};
//# sourceMappingURL=getItemCount.module.js.map
