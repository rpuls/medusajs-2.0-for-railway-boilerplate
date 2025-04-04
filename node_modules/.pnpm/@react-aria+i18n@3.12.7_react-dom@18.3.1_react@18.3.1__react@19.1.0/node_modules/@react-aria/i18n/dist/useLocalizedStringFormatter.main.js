var $47fa5ec5ff482271$exports = require("./context.main.js");
var $fbyBw$internationalizedstring = require("@internationalized/string");
var $fbyBw$react = require("react");


function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

$parcel$export(module.exports, "useLocalizedStringDictionary", () => $fc53663969a3d00a$export$87b761675e8eaa10);
$parcel$export(module.exports, "useLocalizedStringFormatter", () => $fc53663969a3d00a$export$f12b703ca79dfbb1);
/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */ 


const $fc53663969a3d00a$var$cache = new WeakMap();
function $fc53663969a3d00a$var$getCachedDictionary(strings) {
    let dictionary = $fc53663969a3d00a$var$cache.get(strings);
    if (!dictionary) {
        dictionary = new (0, $fbyBw$internationalizedstring.LocalizedStringDictionary)(strings);
        $fc53663969a3d00a$var$cache.set(strings, dictionary);
    }
    return dictionary;
}
function $fc53663969a3d00a$export$87b761675e8eaa10(strings, packageName) {
    return packageName && (0, $fbyBw$internationalizedstring.LocalizedStringDictionary).getGlobalDictionaryForPackage(packageName) || $fc53663969a3d00a$var$getCachedDictionary(strings);
}
function $fc53663969a3d00a$export$f12b703ca79dfbb1(strings, packageName) {
    let { locale: locale } = (0, $47fa5ec5ff482271$exports.useLocale)();
    let dictionary = $fc53663969a3d00a$export$87b761675e8eaa10(strings, packageName);
    return (0, $fbyBw$react.useMemo)(()=>new (0, $fbyBw$internationalizedstring.LocalizedStringFormatter)(locale, dictionary), [
        locale,
        dictionary
    ]);
}


//# sourceMappingURL=useLocalizedStringFormatter.main.js.map
