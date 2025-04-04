var $47fa5ec5ff482271$exports = require("./context.main.js");
var $9DCmA$internationalizeddate = require("@internationalized/date");
var $9DCmA$reactariautils = require("@react-aria/utils");
var $9DCmA$react = require("react");


function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "useDateFormatter", () => $b80c530ff2e20243$export$85fd5fdf27bacc79);
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



function $b80c530ff2e20243$export$85fd5fdf27bacc79(options) {
    // Reuse last options object if it is shallowly equal, which allows the useMemo result to also be reused.
    options = (0, $9DCmA$reactariautils.useDeepMemo)(options !== null && options !== void 0 ? options : {}, $b80c530ff2e20243$var$isEqual);
    let { locale: locale } = (0, $47fa5ec5ff482271$exports.useLocale)();
    return (0, $9DCmA$react.useMemo)(()=>new (0, $9DCmA$internationalizeddate.DateFormatter)(locale, options), [
        locale,
        options
    ]);
}
function $b80c530ff2e20243$var$isEqual(a, b) {
    if (a === b) return true;
    let aKeys = Object.keys(a);
    let bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    for (let key of aKeys){
        if (b[key] !== a[key]) return false;
    }
    return true;
}


//# sourceMappingURL=useDateFormatter.main.js.map
